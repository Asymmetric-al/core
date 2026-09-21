# Phase 24 D82 — Atomic Draft-path Adoption adversarial review

**Decision date:** 2026-08-31

**Founder answer reviewed:** Option 1 — atomically adopt the exact never-public
path.

**Repository status:** planning authority only; no runtime, schema, migration,
Supabase policy, OpenSpec delta, ticket, Vercel configuration, Stripe state,
deployment, public route, or production state changed.

## Final disposition

**Accept with required amendments.** Option 1 is the best permanent answer. It
preserves an already-reviewed private address, eliminates a false collision,
and uses one D2-owned transaction instead of another screen, reservation,
workflow, or incomplete Page state.

The unqualified answer is not safe. The phrase **never-public path** is neither
precise nor fully provable, an availability check is not ownership, private
source History must not be rewritten, the current runtime lacks the required
route namespace, and a dependent descendant closure cannot be silently
transferred. ADR-0204/D83 now settles only the exact qualified source-owned
derived closure while preserving every child owner/input. The accepted D82
answer remains narrowed to one exact **Draft-
only Path Claim** and one **Atomic Draft-path Adoption** inside D80/D81:

1. Core proves the complete D2 canonical key—not merely one source row—has
   never been selected by an activated D1 generation or any public/protected
   route owner under any claimant.
2. Imported or incomplete history fails closed. Analytics, CDN logs, provider
   validation, current-row absence, and Vercel never supply proof.
3. D2 appends/supersedes the current source private claim and creates a fresh
   target Placement/claim in the existing D80/D81 transaction. It never moves
   or relabels the immutable source Placement Revision.
4. The transaction ends with exactly one target-owned current claimant and has
   no observable unowned or double-owned interval.
5. The PageShell review keeps the ordinary editable Parent Page and Web address
   fields, visible source provenance, complete tenant-branded URL, one CTA,
   precise failure states, and repeated **private / not live** meaning. It adds
   no checkbox, RadioGroup, modal, or claim vocabulary.
6. Source Placement History remains authorized and recoverable but does not
   reserve the address. A later restore runs ordinary D2 and never reclaims the
   target-owned key.
7. Public, protected, unknown-history, cross-scope, policy-drifted, and
   incompatible descendant candidates remain ineligible. Only ADR-0204's
   completely qualified D2 source-tree closure is admitted.

This is not a universal CMS “best practice” feature. Current platforms prove
draft/public separation, configurable version history, transactional multi-
write mutation, and optimistic concurrency; PostgreSQL/Supabase prove the
database/authority primitives; W3C supports the review/error behavior. Core's
governing D12 contract—not a vendor default—requires immutable append-only
meaningful checkpoints. The exact operation is a proportionate Core-specific
composition of those components.

## Exact corrected decision to record

> **D82 — Atomic adoption of an exact Draft-only Path Claim.** When D81's
> sealed same-Tenant/environment/Site/locale source Placement candidate is the
> sole current private owner of the exact D2 canonical route key reviewed for
> the D80 target, Core SHALL prefill the target Parent Page and Web address
> with visible source provenance and let staff retain or edit them. Retaining
> them is eligible only after the D2 owner positively proves, over the complete
> canonical equivalence class and every prior claimant, that Core has never
> selected the key in an activated D1 Public Site Generation or admitted it to
> any public, redirect, canonical, predecessor, repair, or protected route
> effect and no platform-reserved, specialized source-owned, scheduled, safety,
> migration, or Trash-retained owner other than the exact eligible current
> private source candidate claim.
> Unknown history and every descendant path effect outside ADR-0204's complete
> qualified source-tree closure fail closed.
>
> At commit, Core SHALL reauthorize and fence the exact source/target effects,
> D79-D81 heads and lease generations, source claim/version, target parent
> chain, Site-locale public base, canonicalizer and route-policy generations,
> and semantic command receipt. In D80/D81's one short all-or-none transaction,
> D2 SHALL supersede the exact current source private claim, append a fresh
> target Placement Revision and target claimant-ownership occurrence/version for the same canonical
> key, retain the immutable source Placement Revision/checkpoint as private
> History, and complete the D81 target/source/head/lease/receipt/audit/outbox
> effects. Database exclusivity remains the final arbiter. A stale or
> conflicting attempt changes nothing; identical replay returns the original
> receipt rather than treating the now-target-owned key as a collision.
>
> D82 SHALL not reassign a source Revision or claimant-ownership-occurrence
> identity; a stable namespace current-owner/version may advance. It SHALL not infer eligibility
> from analytics, provider, Vercel, or current-row absence; auto-suffix; create
> an alias, redirect, reservation service, resolver, queue, or saga; rewrite
> independent references or descendants; publish; alter public caches/search;
> or call Vercel, Stripe, or another provider. The source public Page remains
> unchanged and the target address remains private until a later ordinary D1
> publication.

## Fact classification

### Verified repository facts

- Current `develop` uses a mutable Payload Page with one Tenant relationship
  and scalar `slug`; it has no accepted Site/locale Placement Revision, D2
  route namespace, expected claim head, or D80-D82 mutation.
- The initial CMS migration makes the current slug an ordinary index rather
  than a same-scope uniqueness constraint; current Tenant/slug relationships
  do not provide the required composite integrity.
- Current Page staff access is broad Tenant-role access, not distinct source-
  Placement-supersede plus target-create effects.
- The current public reader selects provider-published Page data by the current
  Tenant/scalar key rather than a D1 immutable Public Site Generation and D2
  canonical route owner.
- Proposed ADR-0146 makes parent, local segment, sibling order, and derived
  normalized path one immutable Placement Revision and requires D1 activation
  for public effect.
- Proposed ADR-0156 requires server-acknowledged Working Revisions, separate
  owner axes, expected-revision CAS, session lease generations, append-only
  restore, and qualified Payload access/lock behavior.
- Proposed ADR-0167 treats a cross-Site source path only as a suggestion,
  forbids suffixing, and creates a private target atomically without changing
  the source. D82 must not widen that command.
- ADR-0201/0202 and the D80/D81 reviews currently block a source-held draft
  route. D82 must amend that single contradiction without weakening all other
  route exclusions.

### Verified current primary-source facts

- Payload drafts keep unpublished versions distinct from published content;
  versions retain history and expose explicit version authorization; awaited
  operations can share one database transaction.
- Payload Local API operations bypass access and document locks by default
  unless authenticated context plus `overrideAccess: false` and
  `overrideLock: false` are supplied.
- Sanity transactions are atomic and support revision-conditional optimistic
  locking; its stable document IDs are not mutable path ownership.
- PostgreSQL uniqueness/constraints decide competing writes, row locks and
  expected-row updates support narrow CAS, and serialization/deadlock failures
  require replay of the complete transaction.
- A partial unique index is not a deferrable unique constraint. D82 should not
  redesign D2 merely to demand deferral; safe write ordering plus the existing
  qualified exclusivity representation and concurrency proof is sufficient.
- Supabase grants and RLS are independent. Update authorization distinguishes
  old-row `USING` from resulting-row `WITH CHECK`; service/BYPASSRLS paths need
  explicit parity.
- Vercel's domain and routing features govern project hosts and public routing
  configuration, not a CMS-private Page path claim.
- Google redirect/canonical guidance applies when a public URL changes. An
  eligible D82 key has no public move and therefore needs no SEO redirect,
  canonical, or sitemap effect until ordinary publication.
- WCAG 2.2 supports reuse of already-entered information, textual errors,
  predictable input behavior, visible correction, and programmatically
  announced status. It does not require a second confirmation modal.

### Reasonable inferences and product judgments

- A single source-owned draft collision is likely enough to cause confusing
  staff workarounds, but no ministry-specific frequency has been measured.
- Preserving a reviewed human-readable address is preferable when correctness
  costs are only a narrow extension of an already-required transaction and D2
  namespace.
- One inline placement group and one final action provide clearer mental
  continuity than a separate “adopt address” choice.
- Exact complete route provenance is a necessary prerequisite; it must not be
  manufactured from traffic evidence.

### Assumptions and unresolved unknowns

- The proposed D2 physical claim/history representation has not merged and may
  change. D82 freezes invariants and owners, not table names.
- The complete route-history census and canonical equivalence rules must be
  finalized in the D2 design before migration or tickets.
- Real ministry incidence and capacity distribution of material-purpose
  handoffs with descendant Page closures is unknown. ADR-0204 admits only
  deterministic source-owned derived closure outcomes and sends every other
  case to ordinary D2 cleanup first.
- Sibling-position treatment is a D2/D80 Placement concern and is not silently
  settled by D82; it may require a later question after the safety-critical
  descendant disposition.

## Current repository and intended-model reconciliation

| Concern        | Current `develop`                               | Governing intended model                                        | Permanent D82 path                                              |
| -------------- | ----------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------- |
| Page/path      | Tenant-only mutable Page and scalar slug        | D1 stable Site/locale Page plus immutable D2 Placement          | No interim slug transfer; wait for full substrate               |
| Uniqueness     | Ordinary slug index/current provider validation | One complete D2 route namespace and DB exclusivity              | D2 canonical key is final arbiter                               |
| Draft/public   | Payload status/latest versions                  | D12 private heads; D1 sole favorable serving head               | Private claim succession changes no D1 state                    |
| History        | Provider versions                               | Immutable D12 Placement History and D2 route-effect history     | Keep source Revision; distinguish evidence from claim authority |
| Authorization  | Broad Tenant role checks                        | Phase 12 exact effects plus RLS/privileged parity               | Require source supersede and target create separately           |
| Concurrency    | Provider request/unique-field behavior          | Expected heads, lease generation, semantic receipt, constraints | Extend D80/D81 transaction and receipt only                     |
| Public routing | Newest provider-published scalar key            | Phase 5 consumes one D1/D2 compiled route result                | Zero public route effect                                        |
| Vercel         | Project deployment/hosts                        | D15/D16/D72 domains; Vercel adapter boundary                    | Display domain only; zero API calls                             |

## Current primary evidence and bounded interpretation

| Primary source                                                                                                                                                                                                                                           | Verified finding                                                         | D82 use                                                 | Rejected overreach                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------- | ----------------------------------------------------------------- |
| [Payload Drafts](https://payloadcms.com/docs/versions/drafts)                                                                                                                                                                                            | Draft changes can remain unpublished                                     | Source and target claims remain private                 | Payload `_status` is not D1/D2 authority                          |
| [Payload Versions](https://payloadcms.com/docs/versions/overview)                                                                                                                                                                                        | Versions retain diff/restore history with separate version access        | Preserve source Placement evidence                      | Provider restore cannot reclaim route ownership                   |
| [Payload transactions](https://payloadcms.com/docs/database/transactions)                                                                                                                                                                                | Awaited operations sharing the request transaction are all-or-none       | Thread every D80-D82 write through one request          | A nominal transaction does not cover separate Supabase HTTP calls |
| [Payload Local API](https://payloadcms.com/docs/local-api/overview)                                                                                                                                                                                      | Access and locks are bypassed by default                                 | Require explicit actor/access/lock/transaction settings | Server-side location is not authorization                         |
| [Sanity transactions](https://www.sanity.io/docs/content-lake/transactions)                                                                                                                                                                              | Multi-mutation transactions and revision conditions prevent stale writes | Supports atomic/CAS composition                         | Sanity IDs or drafts do not define Core paths                     |
| [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)                                                                                                                                                                   | Constraints enforce structural validity under races                      | One current D2 claimant                                 | UI “available” is never enough                                    |
| [PostgreSQL partial indexes](https://www.postgresql.org/docs/current/indexes-partial.html)                                                                                                                                                               | A partial index can enforce an active subset but is not deferrable       | Preserve D2's qualified representation                  | Do not mandate schema churn solely for deferral                   |
| [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)                                                                                                                                                                    | Grants and policies both matter; privileged roles bypass                 | Old/new row and privileged parity tests                 | RLS cannot constrain a bypassing connection by itself             |
| [Vercel domains](https://vercel.com/docs/domains/working-with-domains) and [rewrites](https://vercel.com/docs/routing/rewrites)                                                                                                                          | Hosts and public routing config are separate platform concerns           | Explicit zero-call boundary                             | Vercel is not private route-claim authority                       |
| [Google URL moves](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)                                                                                                                                               | Public URL moves use redirects, canonicals, and updated links            | Confirms no public-history claim is eligible            | Do not create SEO work for a private-only key                     |
| [WCAG Redundant Entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html), [On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html), and [Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) | Reuse known input, avoid unexpected changes, announce status             | Prefill/edit one placement group and reconcile visibly  | Accessibility does not require duplicate ceremony                 |

## Strongest alternative and no-build comparison

The strongest alternative is **always require a different target address**.
It is easy to prove, uses ordinary D2 insertion, and removes special succession
logic. It is the correct fallback whenever provenance is incomplete or D2
cannot share D80/D81's transaction.

It is not the best universal outcome. The source private claim is already being
superseded in D81, the target is already being created, and one database owner
already must arbitrate the namespace. Treating the exact key as unavailable
forever adds human friction without strengthening the post-commit invariant.

The no-build answer—have staff leave the handoff, clean the source, then return
and claim the address—creates two operations, an availability race, an
ambiguous recovery path, and a worse mobile/weak-network experience. The
selected bounded composition is safer and simpler for staff than that
workaround.

## Full adversarial category review

### 1. Problem validity, necessity, and alternatives

**Material concern exists — Medium severity / Medium likelihood.**

- **What could go wrong:** Core builds a general route-transfer product for an
  unmeasured edge case or, conversely, forces unnecessary URL churn for every
  exact private candidate.
- **Why it matters:** both excess architecture and false collisions waste
  ministry staff time and weaken address quality.
- **Evidence/reasoning:** D80/D81 already create the target, clean the source,
  and need D2 uniqueness in one transaction; the incremental root problem is
  one exact ownership succession, not generic migration.
- **Effect on answer:** narrows rather than invalidates Option 1. Option 2 is the
  strongest fallback when positive proof is unavailable.
- **Best permanent fix:** implement only exact same-command, same-scope, draft-
  only succession; measure usage rather than generalize.
- **Required language:** D82-R1-R6, R25; AC1-AC12.

### 2. Brittleness

**Material concern exists — Critical severity / Medium likelihood without a
single canonical compiler.**

- **What could go wrong:** different case, Unicode, percent-encoding, trailing-
  slash, locale-prefix, parent, or route-policy versions make two apparently
  different inputs the same address or make a saved address newly invalid.
- **Why it matters:** duplicate serving, wrong-Page routing, or an unrecoverable
  collision can result.
- **Evidence/reasoning:** ADR-0146 requires deterministic normalized paths;
  current Next.js behavior has framework exceptions such as `.well-known` and
  configured trailing-slash rules.
- **Effect on answer:** requires the sole D2 compiler and exact version fences;
  no D82 normalizer or silent renormalization.
- **Best permanent fix:** bind and revalidate the complete canonical key,
  parent chain, public base, and policy generations; property-test equivalence.
- **Required language:** D82-R2-R5, R11, R17; AC3-AC15, AC39.

### 3. Technical debt

**Material concern exists — High severity / High likelihood if implemented as
a feature-specific subsystem.**

- **What could go wrong:** a second claim table, transfer API, reservation
  service, background cleanup, or Payload hook duplicates D2/D80/D81.
- **Why it matters:** every route class, migration, provider upgrade, and
  incident would need two ownership models.
- **Evidence/reasoning:** proposed D2 and D80/D81 already require the route
  namespace, transaction, compiler, adapters, receipt, and audit.
- **Effect on answer:** removes every new subsystem; D82 is a disposition value
  and atomic-succession branch in existing owners.
- **Best permanent fix:** reuse D2's mutation port and D80/D81 receipt; freeze
  semantic invariants, not schema mechanics.
- **Required language:** D82-R1, R12-R16, R25; AC16-AC24, AC55.

### 4. Edge cases

**Material concern exists — High severity / High likelihood across real
content trees.**

- **What could go wrong:** live-path equality, old redirects, Trash, scheduled
  release, root/system paths, incomplete migration, descendant closures,
  disabled locale, changed parent, long/RTL paths, or target later deletion
  produce wrong ownership or confusing recovery.
- **Why it matters:** these are normal lifecycle combinations, not exotic
  corruption tests.
- **Evidence/reasoning:** D1/D2/D3/Trash/safety owners all constrain the same
  namespace; ADR-0146 makes ancestor changes affect descendant derived paths.
- **Effect on answer:** adds exhaustive exclusions and exact messages;
  ADR-0204 later narrows the descendant blocker only for its completely
  qualified D2 source-tree closure.
- **Best permanent fix:** classify every route-effect owner and lifecycle state;
  fail unknown cases closed and preserve input.
- **Required language:** D82-R4-R9, R17-R20; AC7-AC15, AC25-AC32, AC44-AC49.

### 5. Footguns

**Material concern exists — Critical severity / Medium likelihood.**

- **What could go wrong:** staff read “available” as reserved; a developer
  releases then inserts; restore steals the key; native duplicate appends `-2`;
  identical replay reports a collision after success.
- **Why it matters:** these paths silently change public meaning or make a
  successful handoff look failed.
- **Evidence/reasoning:** UI preflight cannot own a database key, Payload Local
  API bypasses by default, and common CMS slug systems suffix under collision.
- **Effect on answer:** requires advisory language, one transaction, no suffix,
  receipt-first replay, and ordinary D2 restore.
- **Best permanent fix:** structural exclusivity plus explicit semantic receipt
  and native-action suppression.
- **Required language:** D82-R8-R18, R25; AC16-AC36, AC41-AC46.

### 6. Tenant safety

**Material concern exists — Critical severity / Low-to-medium likelihood if
scope is only application convention.**

- **What could go wrong:** a source claim is superseded for another Tenant,
  Site, environment, or locale, or an error leaks the competing Page.
- **Why it matters:** private content structure and public routing could cross
  tenant boundaries.
- **Evidence/reasoning:** current Pages are only Tenant-scoped; permanent D2
  adds exact Site/locale scope, and privileged paths can bypass RLS.
- **Effect on answer:** same-scope composite integrity and non-enumerating
  authorization are mandatory.
- **Best permanent fix:** derive scope server-side; structurally prevent cross-
  scope references; test browser and privileged paths.
- **Required language:** D82-R2, R10, R13-R14; AC4, AC37-AC43.

### 7. Database, RLS, and authorization safety

**Material concern exists — Critical severity / Medium likelihood without one
authoritative mutation boundary.**

- **What could go wrong:** `USING` authorizes a source row while the result
  points elsewhere; per-table constraints allow two typed route owners;
  cascades erase evidence; service/Payload paths bypass actor checks.
- **Why it matters:** an invalid committed route owner cannot be repaired by UI
  convention.
- **Evidence/reasoning:** PostgreSQL FKs are not automatically indexed;
  Supabase separates grants/RLS and old/new policy checks; Payload overrides
  access/locks unless configured.
- **Effect on answer:** mandates same-scope FKs, restrictive deletion,
  namespace-wide exclusivity, equality-leading indexes, least grants, RLS and
  privileged parity.
- **Best permanent fix:** one D2 owner port backed by database invariants and
  hostile tests through every write path.
- **Required language:** D82-R10-R15; AC37-AC46, AC52-AC55.

### 8. Overengineering

**Material concern exists — Medium severity / High likelihood if “transfer” is
treated as a reusable product noun.**

- **What could go wrong:** Core adds reservations, unplaced Pages, route-work
  queues, approval, subtree migration, or a generic claim abstraction.
- **Why it matters:** a bounded convenience becomes a new routing platform and
  staff workflow.
- **Evidence/reasoning:** the existing D2/D80/D81 owners already cover every
  necessary effect; no measured requirement supports generalization.
- **Effect on answer:** confirms the narrow option and explicit non-goals.
- **Best permanent fix:** one eligibility predicate, one disposition on the
  existing plan, one receipt extension, and one inline helper.
- **Required language:** D82-R1, R8, R12, R25; AC1, AC16, AC24, AC55.

### 9. UX/UI and user friction

**Material concern exists — High severity / High likelihood if provenance or
public state is unclear.**

- **What could go wrong:** staff think a free-floating slug is being copied,
  believe the URL is already live, retype it, encounter a modal, lose input on
  conflict, or cannot resolve an uncertain mobile submission.
- **Why it matters:** staff must predict which Page stays live, which draft owns
  the planned address, and whether visitors see a change.
- **Evidence/reasoning:** D2 derives the full path from parent plus segment;
  WCAG favors redundant-entry avoidance, predictable inputs, textual errors,
  and announced persistent status.
- **Effect on answer:** one placement group, full branded URL, exact provenance,
  one CTA, distinct errors, persistent success, and no extra control.
- **Best permanent fix:** usability/accessibility test the five comprehension
  questions and every normal/conflict/unknown state at mobile and desktop.
- **Required language:** D82-R8-R9, R16, R24; AC25-AC36, AC56-AC59.

### 10. Source of truth, ownership, and domain invariants

**Material concern exists — Critical severity / Medium likelihood if private
History is mistaken for active route ownership.**

- **What could go wrong:** source Revision History keeps reserving the key,
  D80's receipt becomes a resolver, or D82 relabels an immutable Placement.
- **Why it matters:** this creates dual ownership and corrupts historical truth.
- **Evidence/reasoning:** D2 owns the current route namespace; D12 owns private
  Revision History; D1 owns public activation; D80/D81 only coordinate.
- **Effect on answer:** explicitly separates immutable evidence, current claim,
  receipt, and public release authority.
- **Best permanent fix:** append source supersession plus a fresh target
  claimant-ownership occurrence/version; never update Revision owner or
  resolve public traffic from receipts/history.
- **Required language:** D82-R2-R7, R12, R18-R20; invariants I1-I24.

### 11. Hidden coupling

**Material concern exists — High severity / Medium likelihood.**

- **What could go wrong:** eligibility depends on Vercel, analytics, provider
  “unique” fields, domain verification, preview tokens, or D23 Copy-to-Site.
- **Why it matters:** outages and unrelated upgrades would block or corrupt a
  local database decision.
- **Evidence/reasoning:** none of those systems owns complete D2 route history;
  proposed D23 intentionally leaves source placement unchanged.
- **Effect on answer:** removes external calls and keeps D82 same-Site D80/D81-
  only.
- **Best permanent fix:** consume versioned durable owner facts and expose zero-
  call proof.
- **Required language:** D82-R1-R5, R19-R20, R25; AC47-AC52.

### 12. Failure modes

**Material concern exists — Critical severity / Medium likelihood under
concurrency or weak networks.**

- **What could go wrong:** source is cleaned but target claim fails, target is
  created without source cleanup, response is lost after commit, or history
  proof becomes unavailable mid-review.
- **Why it matters:** partial ownership and ambiguous retry can lose work or
  create duplicate Pages.
- **Evidence/reasoning:** D81 already requires one failpoint-tested transaction
  and receipt reconciliation; D82 adds another contested fact.
- **Effect on answer:** all effects join the same transaction and uncertain
  outcomes freeze/reconcile.
- **Best permanent fix:** exhaustive write failpoints, receipt-first replay,
  error states that promise **Nothing was moved** only after authoritative
  rollback proof.
- **Required language:** D82-R11-R17; AC16-AC24, AC31-AC36, AC44-AC46.

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern exists — Critical severity / High likelihood in multi-tab
editing.**

- **What could go wrong:** a late save, D1 activation, route repair, Trash
  restore, locale change, or competing claimant makes an individually valid
  review stale; replay then creates a second target.
- **Why it matters:** the correctness window spans several independent heads
  and one human review.
- **Evidence/reasoning:** D12 requires CAS plus lease fencing; PostgreSQL locks
  rows only inside the transaction; preflight is not reservation.
- **Effect on answer:** seals exact versions, locks deterministically, rechecks
  at commit, and ties idempotency to the durable business effect.
- **Best permanent fix:** one semantic key binding source/target/key/effect,
  exact retry, and one winner under every interleaving.
- **Required language:** D82-R10-R17; AC14-AC24, AC33-AC46.

### 14. Data integrity risks

**Material concern exists — Critical severity / Medium likelihood during
migration and mixed versions.**

- **What could go wrong:** incomplete history is marked private, source and
  target claims duplicate, orphaned relationships survive, or an old writer
  recreates the source claim.
- **Why it matters:** route ownership and audit history drift permanently.
- **Evidence/reasoning:** current schema lacks D2 structural uniqueness and
  old runtime writers know only scalar slugs.
- **Effect on answer:** requires complete census, constraint proof, old-writer
  fence, restrictive deletion, and mixed-version fail-closed behavior.
- **Best permanent fix:** expand/shadow/verify/constraint/cutover/contract with
  checksums and rollback-safe retained readers.
- **Required language:** D82-R13, R17, R21-R23; AC37-AC43, AC52-AC55.

### 15. Security and privacy risks

**Material concern exists — High severity / Medium likelihood if messages or
logs enumerate private structure.**

- **What could go wrong:** a collision exposes another Page title/path, broad
  logs store private ministry routes, preview tokens are retargeted, or a
  privileged function trusts caller actor/scope.
- **Why it matters:** private program names, locations, or ministry plans may
  be sensitive even before publication.
- **Evidence/reasoning:** current source/version reads require independent
  authorization; service roles and Payload Local API can bypass ordinary RLS.
- **Effect on answer:** permission-safe errors, minimal audit/digests, no token
  retargeting, and privileged-path parity are mandatory.
- **Best permanent fix:** data minimization, independent resource/version read
  checks, least-owner functions, and hostile non-enumeration tests.
- **Required language:** D82-R10, R14, R18-R24; AC29-AC30, AC37-AC43, AC47-AC51.

### 16. Scalability and performance risks

**Material concern exists — Medium severity / Medium likelihood at high
contention or large history.**

- **What could go wrong:** commit scans full route history, holds locks across
  Page compilation, deadlocks inconsistent resource order, or retries overload
  a large Tenant.
- **Why it matters:** a correctness feature could stall ordinary publishing.
- **Evidence/reasoning:** eligibility spans historical classes, but D33 already
  requires capacity profiles and D80/D81 already needs a short transaction.
- **Effect on answer:** precompute/version durable provenance, fence it at
  commit, use equality-leading indexes and deterministic locks, and test
  measured cohorts.
- **Best permanent fix:** bounded indexed point/summary checks, no remote I/O,
  query-plan/lock evidence before activation; tune only from measurements.
- **Required language:** D82-R13, R15, R22; AC40, AC52-AC55, AC60.

### 17. Operational burden

**Material concern exists — Medium severity / Medium likelihood if unknown
history or partial effects need manual repair.**

- **What could go wrong:** staff need support to clear false “unavailable”
  states or engineers perform direct SQL to repair claim ownership.
- **Why it matters:** manual route surgery is high-risk and creates tribal
  knowledge.
- **Evidence/reasoning:** D82 has deterministic safe fallbacks: choose another
  address or resolve the existing D2 owner; no handoff requires adoption.
- **Effect on answer:** fail closed with cause-owned repair, receipts, runbooks,
  and no direct-database recovery path.
- **Best permanent fix:** make claim/provenance health observable and recovery
  use existing D2/D12 actions; do not add an operator queue preemptively.
- **Required language:** D82-R5, R9, R16-R18, R23-R25; monitor section.

### 18. Observability and auditability gaps

**Material concern exists — High severity / Medium likelihood.**

- **What could go wrong:** technical logs show success while the business
  receipt or claim history disagrees; eligibility failures cannot be explained;
  provider calls occur unnoticed.
- **Why it matters:** diagnosis and safe replay depend on durable business
  history, not request traces.
- **Evidence/reasoning:** D80/D81 already distinguish receipt/audit/outbox from
  best-effort telemetry; D82 adds exact claim succession/provenance.
- **Effect on answer:** extends the business receipt and adds named invariant,
  latency, unknown-outcome, authorization, and zero-provider monitors.
- **Best permanent fix:** privacy-safe correlation IDs/digests, immutable claim
  event, reconcileable receipt, and incident runbooks.
- **Required language:** D82-R16, R23-R25; AC23-AC24, AC47-AC55 and monitors.

### 19. Dependency and integration risks

**Material concern exists — High severity / Medium likelihood.**

- **What could go wrong:** Payload and D2 write through different connections,
  a provider upgrade changes transaction/access behavior, or Vercel routing is
  accidentally invoked.
- **Why it matters:** “atomic” becomes false and deployment state couples to
  private editing.
- **Evidence/reasoning:** Payload transaction participation is request-bound;
  Local API defaults bypass; Vercel domains/rewrites are separate public
  concerns.
- **Effect on answer:** D82 stays disabled unless exact adapter conformance
  proves one PostgreSQL transaction and zero external calls.
- **Best permanent fix:** port-level conformance, exact-build qualification,
  upgrade gate, and Qualification Attachment.
- **Required language:** D82-R14-R15, R19-R22, R25; AC41-AC55.

### 20. Migration, rollout, and upgrade risks

**Material concern exists — Critical severity / High likelihood from the
current scalar-slug model.**

- **What could go wrong:** backfill labels unknown legacy routes “never
  published,” mixed writers bypass the namespace, constraint creation finds
  duplicates, or rollback loses readers for new claim events.
- **Why it matters:** a false private classification can repurpose a real
  public address.
- **Evidence/reasoning:** current rows do not contain complete D1/D2 provenance
  and current public reads use provider-published slug behavior.
- **Effect on answer:** no in-place shortcut; use complete census, unknown
  classification, shadow comparison, old-writer fence, cohort rollout, and
  roll-forward readers.
- **Best permanent fix:** additive migration with checksum/constraint proof;
  rollback disables new commands but preserves committed history.
- **Required language:** D82-R5, R21-R23, R25; AC10-AC12, AC52-AC55, AC60.

### 21. Testability, traceability, and proof

**Material concern exists — High severity / High likelihood if “atomic” and
“never public” remain prose assertions.**

- **What could go wrong:** tests cover only happy UI state, skip normalized
  equivalents/authorization/failpoints, or artifacts contradict whether
  private History reserves a path.
- **Why it matters:** the highest-risk claims would be neither falsifiable nor
  traceable to release evidence.
- **Evidence/reasoning:** D82 affects D2, D12, D80, D81, Phase 12, migration,
  RLS, Payload, and D33; current docs contain one explicit contradiction.
- **Effect on answer:** requires exact requirements, invariants, 60 ACs,
  production-shaped proof, and reconciliation across all named artifacts.
- **Best permanent fix:** map one D82 ID set from decision/ADR through OpenSpec,
  design, tasks, tickets, implementation, tests, D33, and release evidence.
- **Required language:** D82-R1-R25; all invariants and acceptance criteria.

### 22. Other development hazards

**Material concern exists — High severity / Medium likelihood.**

- **What could go wrong:** D82 silently chooses a child/subtree disposition or
  freezes sibling order even though Placement includes both; a future restore
  or copy then behaves inconsistently.
- **Why it matters:** hidden information-architecture decisions expand the
  command beyond the exact Page and surprise staff.
- **Evidence/reasoning:** ADR-0146 derives descendant paths from hierarchy and
  stores sibling order in Placement; D80 is intentionally one-Page only.
- **Effect on answer:** ADR-0204 admits only a fully qualified D2-derived source
  closure; ADR-0205 independently settles only the fresh target position. D82
  owns neither.
- **Best permanent fix:** use ADR-0204's atomic derivation/fallback and
  ADR-0205's D2 reviewed-gap-or-known-append-last contract; never smuggle
  descendants, source order, or provider rank into D82.
- **Required language:** D82-R6, R18, R25; ADR-0204/0205; AC13, AC48-AC49,
  AC60.

## Required specification language

### D82-R1 — One narrow same-Site disposition

D82 SHALL exist only inside an authorized D80/D81 material-purpose handoff for
one exact source and target in the same Tenant, environment, Site, and locale.
It SHALL NOT widen D23 Copy-to-Site, generic duplicate, migration, or route
transfer behavior.

### D82-R2 — Precise Draft-only Path Claim term

The spec SHALL use **Draft-only Path Claim**, not unqualified “never-public” or
“never historical.” Private source Revision/checkpoint History remains valid
evidence and does not reserve the key after supersession.

### D82-R3 — Sole canonical route key

D2's one versioned compiler SHALL derive the complete key and equivalence class
from trusted scope, public base, parent, segment, canonicalizer, and route-
policy generations. Compiler/policy generation SHALL be fenced metadata, not a
namespace partition that permits one effective path per version; old/new
equivalents remain exclusive through migration. D82 SHALL create no alternate
normalizer.

### D82-R4 — Complete positive eligibility

Every claimant and public/protected route-effect class SHALL prove absence of
activated/public, redirect/rewrite/alias/canonical, predecessor/repair,
protected, platform-reserved/system/root/Home, specialized source-owned,
scheduled, safety, migration, tombstone, and Trash-retained effects. The exact
eligible current private source candidate claim is the sole permitted owner.
Source live/current or historical public keys are always ineligible.

### D82-R5 — Unknown is ineligible

Incomplete imports/migrations, unavailable readers, stale projections, or
absence from current rows, analytics, logs, CDN, search, provider, or Vercel
SHALL NOT establish eligibility.

### D82-R6 — Dependent descendant closure is owner-qualified

Any source candidate whose hierarchy change produces a dependent descendant
draft-path closure SHALL remain unavailable unless the entire closure passes
ADR-0204's exact Atomic Source-tree Draft-path Re-derivation contract. D82 SHALL
move, copy, reparent, transfer, or invalidate no descendant. Every stale,
inaccessible, protected, independently incompatible, unknown, or over-capacity
closure SHALL use ordinary D2 cleanup first.

### D82-R7 — Immutable source and fresh target identities

The source Placement Revision/checkpoint SHALL remain immutable. Commit SHALL
supersede its exact current private claim and append a fresh target Placement
Revision plus a fresh target claimant-ownership occurrence/version. A stable
canonical-key namespace row may retain its identity; Core SHALL never reassign
or relabel source Revision/ownership-event identities.

### D82-R8 — One editable placement group

The existing Parent Page and local Web address inputs SHALL display the
complete tenant-branded address and exact source provenance. Editing either
input removes the adoption disposition and uses ordinary D2 validation. D82
adds no separate choice control or redundant entry.

### D82-R9 — Precise persistent states

Checking, eligible, ordinary edited address, current-rule failure, parent
failure, competing claim, source drift, proof unavailable, permission denial,
unknown outcome, and success SHALL have persistent textual, cause-owned states
that preserve input and never depend only on color/icon/toast.

### D82-R10 — Exact existing authority

Commit SHALL require current source Placement read/edit/supersede authority,
target Page/Placement create/edit authority, every D79-D81 effect, and
independent history/receipt reads where shown. Target authority never implies
source authority. Server context derives scope, actor, owners, and attribution.

### D82-R11 — Sealed expected-state plan

Preflight SHALL bind all D80/D81 heads/leases/public pins plus source claim and
route-evidence versions, target key/parent chain, Site-locale public base,
canonicalizer/reservation/route-policy generations, actor effect epoch, and
semantic command digest. It SHALL not reserve the path.

### D82-R12 — One atomic succession

One short D80/D81 transaction SHALL create the complete target, fresh target
Placement/claim, exact source-claim supersession, D81 checkpoint/clean heads/
lease fences, claim history, receipt, audit, and outbox or none. No observable
gap or dual ownership is permitted.

### D82-R13 — Structural integrity and indexing

One namespace-wide DB exclusivity rule SHALL cover all competing typed route
claims. Same-scope composite keys/FKs, non-null owners, restrictive lifecycle,
checks, and equality-leading indexes SHALL protect claims, revisions, parents,
receipts, and common authorization/CAS lookups. D82 SHALL not require a new
physical table or deferrable constraint when D2's proven representation
satisfies the invariants.

### D82-R14 — Grants, RLS, functions, and privileged parity

Browser/Data API roles SHALL have no direct adoption DML. Least grants and RLS
SHALL enforce old-row `USING` and new-row `WITH CHECK` where exposed. Views,
RPCs/functions, service/BYPASSRLS, Payload, workers, imports, migrations,
support, and repair SHALL pass the same scope/effect/non-enumeration tests.

### D82-R15 — Qualified short transaction

All qualified Payload/database writes SHALL be awaited under the same request
transaction with access/lock/locale settings. Locks use one documented order;
no remote I/O or user wait occurs under lock. If one authoritative PostgreSQL
boundary is unavailable, D82 remains disabled rather than adding a saga.

### D82-R16 — Semantic idempotency and unknown-result reconciliation

The semantic key SHALL bind source candidate/claim, target identity/claim,
canonical key, effect, and policy generations. Same-input replay returns the
one receipt despite target ownership; changed-input reuse conflicts. A lost
response reconciles before retry or editing.

### D82-R17 — Fail-safe conflicts and drift

Any stale head/lease/claim/permission, incomplete history, rule change,
competing claimant, constraint failure, or write failure SHALL preserve the
source candidate/claim/lease and create no target. UI wording SHALL distinguish
repair causes and reveal another owner only with independent read authority.

### D82-R18 — History and restore never reclaim

Authorized source History SHALL retain the old private Placement value. Any
later source or target Placement restore SHALL append a new D2-reviewed draft,
never reclaim, overwrite, silently omit, suffix, or synchronize the other
Page's current claim.

### D82-R19 — Target stays private

The target has no public D1 route or canonical after D82. Authorized preview is
revision-scoped, private, `no-store`, and `noindex`; source preview tokens never
retarget. Target publication remains a later ordinary D1 decision.

### D82-R20 — Public, Vercel, SEO, and money no-effect

Source public bytes/routes/canonical/Navigation/search/sitemap/cache/schedule/
donor result remain unchanged. D82 creates no redirect/alias/rewrite or Vercel,
DNS/TLS/deployment, Stripe/currency/gift/ledger/receipt/email/form/CRM/provider
effect.

### D82-R21 — Safe migration and rollout

Rollout SHALL use additive schema, complete route census/classification,
unknown-history ineligibility, shadow comparison, structural constraints,
old-writer fencing, limited cohort, and contract. Mixed versions fail closed;
rollback disables new commands but preserves committed facts.

### D82-R22 — Bounded capacity

Eligibility and commit SHALL use indexed bounded lookups/versioned summaries,
not a full-history scan or N+1 traversal under lock. D33 SHALL prove Minimum,
Typical, and Measured-maximum latency, lock, retry, and history cells under
contention.

### D82-R23 — Durable business audit and observable invariants

Claim succession, receipt, actor/effect, scope, source/target versions, key and
policy digests, eligibility evidence version, D80/D81 result, outcome, and time
SHALL be durable and authorization-bounded. Logs/metrics SHALL be minimized and
SHALL NOT become route authority.

### D82-R24 — Accessible, localized, weak-network UX

The PageShell/Base UI/base-maia/Zinc surface SHALL support native semantics,
linked errors, visible focus, keyboard/screen reader, forced colors, reduced
motion, 44-pixel targets, 320-CSS-pixel/400-percent reflow, bidi-safe wrapping
URLs, CJK/RTL/long labels, polite status, and receipt recovery without focus
theft or lost input.

### D82-R25 — Explicit non-goals and traceability

D82 SHALL add no new workflow, role, approval, reservation service, generic
claim transfer, unplaced lifecycle, resolver, history engine, second D82-
specific route inventory/ledger, queue, saga, cross-request lock, silent suffix,
subtree transfer, reference rewrite, Vercel dependency, or money path. It SHALL
reuse D2's authoritative route namespace and versioned provenance summary. The D82 IDs SHALL trace through
glossary, ADR, OpenSpec, design, tasks, tickets, tests, D33, and release proof.

## Domain invariants

1. **I1:** One successful D82 semantic command creates exactly one fresh target
   Page/Placement/claim result and extends exactly one D80/D81 receipt.
2. **I2:** The source and target always share the exact trusted Tenant,
   environment, Site, and stable locale; no cross-scope adoption exists.
3. **I3:** D2's one canonical compiler and versioned route-policy contract
   define key equality; UI strings and provider slugs never do.
4. **I4:** Eligibility is affirmative over the complete canonical equivalence
   class and all route-effect owners; unknown is never eligible.
5. **I5:** A key with any activated/public/protected, platform-reserved,
   specialized source-owned, scheduled, safety, migration, or Trash route
   effect is never adopted through D82; the exact eligible current private
   source candidate claim is the sole permitted owner.
6. **I6:** The exact source private candidate claim is current and sole before
   commit; no unrelated private claim can be selected as predecessor.
7. **I7:** The immutable source Placement Revision/checkpoint remains unchanged
   and authorization-bounded after commit.
8. **I8:** Private Revision History is evidence, not a current claimant or
   public route owner.
9. **I9:** The target Placement Revision and claimant-ownership occurrence/
   version are fresh; a stable canonical-key namespace row may retain its
   identity. No source identity, history, lease, permission, or owner authority
   transfers.
10. **I10:** D82's externally visible pre-commit boundary has the exact source
    claimant and its post-commit boundary has the exact target claimant; no
    visible zero-owner or dual-owner interval exists during the command.
11. **I11:** Database exclusivity and same-scope integrity, not preflight, are
    the final race arbiter.
12. **I12:** Every D79-D82 head, claim, lease, public pin, policy version, and
    actor effect sealed by preflight is current at commit or the command changes
    nothing.
13. **I13:** A successful handoff completes target creation, source claim
    supersession, target claim creation, checkpoint, clean source successors,
    head advances, lease fences, receipt, audit, and outbox atomically.
14. **I14:** A failed or conflicting command leaves the source candidate,
    source current private claim, leases, and public state unchanged and creates
    no target.
15. **I15:** Replay with the same semantic-command key and identical canonical
    request has one durable effect; reuse with a different request has none.
16. **I16:** An unknown transport outcome is reconciled from the receipt before
    any retry, source edit, or target creation.
17. **I17:** Target authority implies no source supersede, source History, or
    receipt authority; every exact resource/effect is authorized independently.
18. **I18:** Caller input supplies no authoritative Tenant, Site, locale, actor,
    source owner, target owner, claim owner, public pin, policy, or audit fact.
19. **I19:** Editing parent or segment away from the exact sealed values removes
    adoption and uses ordinary D2 claim semantics without hidden transfer.
20. **I20:** Later D2/Trash lifecycle may supersede, protect, or release the
    target claim, but no source/target restore, Trash, purge, or edit returns it
    automatically to the source, mutates source History, silently suffixes, or
    synchronizes the Pages.
21. **I21:** D82 changes no descendant identity, direct Placement input,
    existing History row, owner, or Navigation. ADR-0204/D83 may atomically
    recompute only D2-owned private derived path/breadcrumb/claim outputs and
    append only its qualified cause-labelled successor when accepted D2 storage
    requires it; every other affected closure blocks.
22. **I22:** The source public generation and donor-visible result are identical
    before and after D82; the target remains private and has no public canonical.
23. **I23:** D82 performs no Vercel, DNS/TLS, deployment, redirect, search,
    cache, Stripe, money, message, CRM, or other remote/provider effect.
24. **I24:** Receipts, audits, projections, UI helpers, logs, and metrics never
    become the canonical route compiler, current claim owner, public serving
    head, or write authority.

## Lifecycle and valid transitions

| State                                 | Valid next action                                    | Forbidden transition/result                  |
| ------------------------------------- | ---------------------------------------------------- | -------------------------------------------- |
| Candidate unacknowledged              | Save or resolve D12 state                            | Adopt browser-only input                     |
| D79/D80/D81 incomplete                | Finish existing review/repair                        | Enter D82 independently                      |
| Exact private source claim found      | Run complete eligibility preflight                   | Treat lookup as reservation                  |
| History incomplete/unavailable        | Choose another address or repair owning history      | Infer eligibility from absence/logs          |
| Public/protected effect found         | Ordinary D2/D3/route-owner path                      | Adopt through D82                            |
| Qualified source descendant closure   | Apply ADR-0204 in the same atomic handoff            | Move, transfer, or partially update children |
| Incompatible/over-capacity closure    | Resolve ordinary D2 tree work first                  | Weaken atomicity or invent a saga            |
| Exact eligible sealed plan            | Submit one semantic D80-D82 command                  | Release source claim in advance              |
| Parent/segment edited                 | Ordinary D2 validation                               | Retain stale source provenance               |
| Commit in progress                    | Await or reconcile one receipt                       | Edit, resubmit, or navigate by validation    |
| Conflict/stale/failure                | Preserve all source/input; repair and re-review      | Partial target/claim/source clean            |
| Outcome unknown                       | Receipt lookup then committed result or fresh review | Call failed or blind retry                   |
| Committed                             | One target private claim; source History retained    | Report target ownership as collision         |
| Source History restore requested      | Append ordinary D2-reviewed successor                | Reclaim or suffix adopted key                |
| Target later edited/published/trashed | Ordinary D1/D2/D12/Trash lifecycle                   | Return key or synchronize source             |

## Logical data and authority shape

D82 extends existing D2/D80/D81 facts; exact physical names remain a future
design choice:

- **Canonical route key:** trusted Tenant/environment/Site/stable-locale
  namespace plus the normalized derived path or D2's qualified equivalent.
  Canonicalizer and route-policy generations accompany and fence the key; they
  never create parallel uniqueness partitions for equivalent paths.
- **Current private claim:** exact source owner/Placement Revision and expected
  ownership version before commit; exact target owner, fresh target Placement
  Revision, and fresh claimant-ownership occurrence/version after commit. A
  stable canonical-key namespace row may retain its identity.
- **Route-effect provenance:** durable versioned evidence that classifies every
  current/historical owner class and can positively answer draft-only
  eligibility without scanning all history under lock.
- **Immutable claim-succession event:** stable namespace key ID where one
  exists, source/target claimant-ownership occurrence/version and Placement
  IDs, key digest, eligibility/policy versions, cause, actor/effect, time, and
  D80/D81 receipt reference. It stores no Page body and resolves no request.
- **Extended Material-purpose Page Handoff Receipt:** canonical request digest,
  exact source/target/head/claim/key/policy pins, target result, D81 result,
  outcome, adapter/schema generations, and currently authorized terminal state.
- **Read projections:** staff readiness/error/audit views derived from the
  owners above. They may be cached but are never accepted back as authority.

The exact active-claim representation may be a partial unique index, a stable
namespace row with an expected owner/version, or another D2-qualified model.
The design SHALL prove one namespace-wide winner across typed route classes and
safe update ordering. D82 does not prescribe a transfer table or demand a
deferrable constraint that PostgreSQL cannot apply to a partial unique index.

## Staff UX specification

### Main review

The existing D80/D81 PageShell review keeps one main-column semantic order:

1. fixed source context and material-purpose consequence;
2. target title;
3. one target placement group containing Parent Page, local Web address, full
   tenant-branded planned URL, and source provenance when exact;
4. transfer/repair summary;
5. two outcome rows—new private target first, source that stays live second;
6. compare/back actions and one primary **Move saved changes to new Page
   draft** action.

Ready-state example:

> **Parent Page**  
> Serve
>
> **Web address**  
> `/short-term-teams`
>
> **Full address**  
> `https://hoperelief.org/serve/short-term-teams`
>
> **From About's saved draft**  
> Core has not published this address. If you keep it, it will be reserved for
> the new private Page when these changes move. It will not be live yet.

The copy intentionally says **Core has not published** rather than asserting
Internet-wide history. It says **will be reserved** rather than implying
preflight ownership. URL components use bidi isolation and remain selectable,
copyable, and wrapping; accessible text exposes the complete URL rather than
visually concatenating unlabeled fragments.

The staff phrase **reserved for this Page** means current private Page claim
ownership after commit; it is not the distinct D2 **platform-reserved route**
class, which is always ineligible.

If staff change Parent Page or Web address, provenance disappears and the
group says **New address for this Page. We will check it again when you move
the changes.** Returning to the exact values requires a new server check before
the provenance returns. No validation mutates the Page, steals focus, or
navigates.

### Exact persistent states

| State                              | Required persistent copy/action                                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Checking exact candidate           | **Checking this web address...**; input remains editable until final submit                                                                      |
| Exact eligible candidate           | **Can be used for this move** plus source provenance and private/not-live explanation                                                            |
| Edited ordinary address            | **New address for this Page. We will check it again when you move the changes.**                                                                 |
| Public/protected history           | **This saved address has public or protected Core history and cannot move. Choose another address.**                                             |
| Current rule invalid               | **This saved address no longer meets the current web-address rules. Choose another address. Nothing was moved.**                                 |
| Parent invalid                     | **`<Parent>` is no longer available as the parent. Choose another Parent Page. Nothing was moved.**                                              |
| Competitor won                     | **That address became unavailable. Choose another address. Nothing was moved.**                                                                  |
| Source drift                       | **`<Source>`'s saved address changed since this review. Review the latest saved version. Nothing was moved.**                                    |
| Qualified descendant closure       | **2 related draft addresses will update. These Pages stay under About. Their live addresses and Navigation will not change.**                    |
| Incompatible descendant closure    | **One related Page has other saved address changes. Review it in Pages, then try again. Nothing was moved.**                                     |
| Proof unavailable                  | **We couldn't verify this address right now. Nothing was moved. Try again.**                                                                     |
| Moving                             | Existing D81 persistent progress, with no second submission                                                                                      |
| Outcome unknown                    | **Checking whether the changes were moved...**; no retry/edit until receipt resolution                                                           |
| Success                            | **Saved changes moved. `<path>` is reserved for `<target>`. It is not live. `<source>` remains live at `<source path>`. Nothing was published.** |
| Source Placement restore collision | Authorized target name or generic **This saved address is no longer available. Choose another address.**                                         |

Errors use the existing Core error summary and native Field/FieldDescription/
FieldError association and preserve all values. A failed submission moves
focus once to the summary; activating a summary link moves focus to its
repairable input. Another claimant is named only with current independent
read authority. Status uses polite live announcements without repeatedly
speaking every keystroke or moving focus.

### Donor and public experience

Donors and unauthenticated visitors receive no D82 UI, warning, redirect,
interstitial, branding, or route change. `/about` serves the same D1-selected
release. The planned target path remains unavailable publicly until its own
later D1 release. Public snapshots must be byte- and effect-equivalent across
D82, excluding unrelated nondeterministic transport metadata.

## Acceptance criteria

1. **AC1:** D82 appears only inside one ready same-Site D80/D81 material-purpose
   handoff and creates no standalone action or endpoint behavior.
2. **AC2:** UI, ADR, OpenSpec, code, and tests use **Draft-only Path Claim** and
   **Atomic Draft-path Adoption** consistently, not “never historical.”
3. **AC3:** One D2 compiler derives identical canonical keys for UI preflight,
   transaction proof, uniqueness, preview, later D1 validation, and tests.
4. **AC4:** Cross-Tenant, environment, Site, locale, canonicalizer, public-base,
   parent, or route-policy input can never select an eligible predecessor.
5. **AC5:** Case, slash, percent-encoding, decoded form, Unicode normalization,
   locale prefix, `.well-known`, static, API, catch-all, root, and platform-reserved path
   equivalence properties are tested from the D2 contract; D72 remains the
   separate host/IDN display owner.
6. **AC6:** The exact source candidate is the one sole current private claimant;
   another private claimant or stale owner/version creates no effect.
7. **AC7:** Every activated D1, redirect, rewrite, alias, canonical,
   predecessor, repair, protected, platform-reserved, specialized source-owned,
   scheduled, safety, migration, tombstone, and Trash-retained fixture is
   ineligible under every prior owner; only the exact current private source
   candidate claim may own the key before adoption.
8. **AC8:** A true prior route-not-found request or host-global normalization
   before not-found does not by itself create tenant route-owner history, but
   every equivalent spelling is checked; unrecorded served tenant content
   fails closed and opens an integrity/security incident. A correctly
   authorized revision-scoped private preview also creates no public history;
   any preview authorization bypass fails closed and invokes security response.
9. **AC9:** Private source Revision/checkpoint History remains readable under
   its exact authority and does not reserve the key after success.
10. **AC10:** Legacy/imported/unknown history, missing retained reader, stale
    projection, or incomplete classification is ineligible.
11. **AC11:** No eligibility decision reads analytics, CDN/request logs, Search
    Console, provider validation, Vercel, or only the current claim row as
    authority.
12. **AC12:** Source current/historical public addresses are always ineligible,
    including normalized equivalents.
13. **AC13:** A dependent descendant draft-path closure either passes
    ADR-0204's exact complete derived-only contract in the same atomic handoff
    or blocks with the owning state. No child identity, direct Placement input,
    existing History row, owner, or Navigation changes; only ADR-0204's
    qualified cause-labelled successor may append.
14. **AC14:** Parent-chain, public-base, canonicalizer, reservation, or route-
    policy drift after review invalidates the plan and changes nothing.
15. **AC15:** Current rule invalidity never silently normalizes, transliterates,
    suffixes, or replaces the reviewed address.
16. **AC16:** Success appends a fresh target Placement Revision and claimant-
    ownership occurrence/version; a stable canonical-key namespace row may
    retain its identity, while no source Revision/ownership-event identity is
    reassigned or relabeled.
17. **AC17:** The immutable source candidate/checkpoint retains its exact parent,
    segment, path, digest, cause, and authorization boundary.
18. **AC18:** One transaction completes source claim supersession, target claim,
    target creation, D81 checkpoint/clean heads/lease fences, claim event,
    receipt, audit, and outbox or none.
19. **AC19:** Every write failpoint rolls back all D80-D82 effects and leaves the
    source candidate, current claim, lease, and public state unchanged.
20. **AC20:** D82 exposes exactly the sealed source claimant before commit and
    exactly the fresh target ownership occurrence after commit, with no visible
    zero-owner or dual-owner interval during the command.
21. **AC21:** Exact uniqueness/owner CAS, not a read-before-write UI check,
    chooses one winner under concurrent target claims.
22. **AC22:** Deterministic lock order and deadlock/serialization retry replay
    only the complete exact semantic command.
23. **AC23:** Same semantic-command key plus identical canonical request replay
    returns one receipt/target and creates no new claim, Page, checkpoint,
    successor, audit effect, or lease change.
24. **AC24:** Reusing that semantic-command key with a different canonical
    request conflicts and changes nothing.
25. **AC25:** A committed response lost after target ownership reconciles as
    success before collision handling; it is never shown as “address in use.”
26. **AC26:** The placement group shows Parent Page, local segment, complete
    tenant-branded URL, source provenance, and private/not-live meaning in one
    semantic reading order.
27. **AC27:** Staff never retype an exact candidate and no adoption checkbox,
    RadioGroup, modal, wizard, typed phrase, or second CTA exists.
28. **AC28:** Editing parent or segment removes provenance and applies ordinary
    D2 validation; returning to exact values rechecks before restoring it.
29. **AC29:** Input/change/checking causes no mutation, navigation, submit, or
    focus move.
30. **AC30:** Checking, eligible, edited, history-blocked, invalid-rule, invalid-
    parent, competitor, source-drift, descendant, unavailable-proof, unknown,
    and success states use required persistent text.
31. **AC31:** Every error preserves input, links summary to fields, focuses the
    correct repair, and never relies only on toast/color/icon/hover/motion.
32. **AC32:** Another claimant's identity/details appear only with independent
    current read authority; otherwise the error is non-enumerating.
33. **AC33:** The primary action remains **Move saved changes to new Page
    draft** and the outcome summary says source stays live/target stays private.
34. **AC34:** Success focuses the target heading only after receipt, fresh target
    read/edit authority, and ordinary target lease; otherwise D81's detail-free
    committed result appears.
35. **AC35:** Success retains **Draft - not live**, planned address, source live
    address, and **Nothing was published** as persistent text.
36. **AC36:** Weak-network/lost-response UX prevents double submission, blind
    retry, successor source edit, and duplicate target creation.
37. **AC37:** Actor without current source Placement supersede authority cannot
    adopt even with target create/edit authority.
38. **AC38:** Actor, Tenant, environment, Site, locale, owners, heads, claims,
    policy versions, and audit attribution are server-derived.
39. **AC39:** Same-scope composite FKs/checks reject cross-scope or null owner/
    parent/claim/receipt relationships.
40. **AC40:** Namespace-wide exclusivity covers every typed competing class and
    has equality-leading query/lock/RLS indexes with passing real plans.
41. **AC41:** Restrictive lifecycle/deletion rules preserve claim history and
    prevent cascade/`SET NULL` erasure or replay resurrection.
42. **AC42:** Browser/anonymous/authenticated Data API roles have no direct
    adoption DML; exposed policies test `SELECT`, old-row `USING`, and resulting
    row `WITH CHECK` independently.
43. **AC43:** Views, RPCs/functions, service/BYPASSRLS, Payload, worker, import,
    migration, support, and repair paths pass identical allow/deny/scope/
    non-enumeration tests.
44. **AC44:** Qualified Payload calls are awaited, share one request transaction,
    pass actor context, and set access/lock/locale options; separate Supabase
    HTTP mutation fails conformance.
45. **AC45:** Source save, lease takeover, D1 activation, D3 repair, Trash
    restore, locale/Site change, permission revocation, and competitor races
    each have one safe winner and no partial effect.
46. **AC46:** An uncertain receipt lookup never leaks a now-inaccessible target
    and never permits a new command until terminal reconciliation.
47. **AC47:** Source Editorial restore can proceed independently; source
    Placement restore revalidates through D2 and reports collision without
    reclaim, overwrite, omission, suffix, or target mutation.
48. **AC48:** Target edit, restore, publication, withdrawal, Trash, purge, or
    access loss may supersede, protect, or release its claim only through the
    existing D1/D2/D12/Trash owner; it never returns the key automatically to
    the source or mutates source History.
49. **AC49:** Independent Navigation, stable Page-identity references, literal
    path references, descendant identities/direct Placement inputs/History,
    and sibling order are not silently rewritten by D82. ADR-0204 may change
    only D2-owned private derived closure output.
50. **AC50:** Authorized preview binds the fresh target revision/Placement, is
    private/`no-store`/`noindex`, and never retargets a source token.
51. **AC51:** Source public body/route/canonical/Navigation/search/sitemap/cache/
    schedule/safety/donor snapshots are unchanged and target has no public
    route after D82.
52. **AC52:** Transaction traces prove zero Vercel/domain/DNS/TLS/deployment/
    rewrite/search/cache/Stripe/money/message/form/CRM/provider/network calls.
53. **AC53:** Migration tests classify unknown history ineligible, detect
    duplicates, verify checksums/constraints, fence old scalar-slug writers,
    and preserve committed facts through rollback.
54. **AC54:** Mixed schema/code/canonicalizer/route-policy/adapter versions fail
    closed and no lossy down migration or read-time mutation invents
    eligibility.
55. **AC55:** Exact provider build conformance suppresses native duplicate/
    suffix/restore bypass and proves one Postgres transaction through all
    nested operations.
56. **AC56:** Keyboard, screen-reader, visible focus, field/error association,
    forced colors, reduced motion, and polite status tests pass without mouse,
    color, hover, animation, or focus theft.
57. **AC57:** One DOM/reading order reflows at 320 CSS pixels and 400 percent
    without losing URL, provenance, error, consequence, or action.
58. **AC58:** Touch targets are at least 44 CSS pixels; bidi-isolated wrapping
    URLs and long/CJK/RTL labels/titles remain understandable, selectable, and
    operable.
59. **AC59:** Representative ministry staff can answer without coaching which
    Page stays live, which draft owns the address, whether it is live, what a
    conflict does, and that children/Navigation do not move.
60. **AC60:** D33 proves bounded indexed eligibility and transaction latency/
    lock/retry/history behavior under Minimum, Typical, Measured-maximum, and
    same-route-key-contention cells; ADR/OpenSpec/design/tasks/tickets/tests/release
    evidence and the zero-Vercel Qualification Attachment trace every D82 ID.

## Required proof suite

- **Domain/property:** canonical equivalence classes, every owner/effect class,
  positive private-only proof, private-History-not-claim, fresh identities,
  one current claimant, and exact public no-effect.
- **Positive:** exact eligible Hope Relief source key becomes one target private
  claim while source checkpoint stays intact and `/about` remains serving;
  ADR-0204's exact qualified source-descendant closure produces exhaustive
  successor/public-pin-convergence/unchanged-current-private-effect outcomes
  without moving children.
- **Negative/boundary:** every public/protected/platform-reserved/specialized-
  source-owned/safety/scheduled/Trash/import-unknown/root/static/API/framework/
  locale/canonicalizer case, other than the exact eligible current private
  source claim, plus source-current-public-key and every stale, inaccessible,
  protected, independently incompatible, unknown, or over-capacity descendant
  closure changes no authoritative source/target/head/claim/business fact.
- **Authorization/RLS:** source-only, target-only, both, neither, wrong Tenant/
  Site/locale, revoked mid-review, history-only, browser, invoker/definer,
  service/BYPASSRLS, Payload, worker/import/migration/support/repair.
- **Concurrency/idempotency:** two target claimants, source save/takeover,
  descendant insert/reparent/Placement-head/lease drift, D1/D3/Trash/route-
  policy race, every write failpoint, deadlock/
  serialization, same/different semantic replay, lost response, and post-
  success target-owned collision reconciliation.
- **Migration/deploy:** dirty legacy census, unknown provenance, duplicate
  discovery, additive readers, constraint validation, old-writer fence, mixed
  generations, cohort kill switch, rollback/roll-forward, retained receipts.
- **Provider:** exact Payload build, awaited nested writes, transaction request,
  `overrideAccess: false`, `overrideLock: false`, `fallbackLocale: false`, native
  duplicate/suffix/restore suppression, N/N+1 and rollback behavior.
- **UX/accessibility:** ready/edited/every failure/unknown/success/restore,
  keyboard, screen reader, focus, error summary, forced colors, reduced motion,
  touch, 320 CSS px, 400%, CJK/RTL/bidi/long URL, slow/offline/reconnect, and the
  five comprehension questions.
- **Performance/operations:** real Postgres query plans, equality-leading
  indexes, lock order, same-route-key contention, history-summary version fencing,
  Min/Typical/Measured-max D33 cells, monitor/runbook exercise, and zero Vercel
  or provider calls.

## Named monitors and required responses

| Signal                                                                                  | Threshold                                                                                                                                                  | Owner                             | Required response                                                                                                                                             |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ineligible key adopted (public/protected/platform-reserved/specialized/unknown history) | Any event                                                                                                                                                  | D2 route owner + security on-call | Disable D82 globally; preserve claim/history evidence; fence affected routes; invoke integrity/security response; reactivate only after full census and proof |
| D82 pre/post claimant boundary mismatch                                                 | Any D82 command without the exact sealed source claimant before commit or exact target ownership occurrence after commit, or with a visible gap/dual owner | Database + D2 owner               | Disable D80-D82; block repair automation; reconcile from immutable receipts/events; inspect every handoff since last known-good deploy                        |
| Source Revision/ownership-occurrence identity relabeled or history lost                 | Any event                                                                                                                                                  | D12 history + D2 owner            | Halt adoption/pruning; restore authorized evidence from backup; audit adapter and migration paths                                                             |
| Duplicate successful target/claim for one semantic command                              | Any event                                                                                                                                                  | Database owner                    | Disable cohort; quarantine without deletion; audit uniqueness/idempotency and all replicas/writers                                                            |
| Unknown outcome unresolved                                                              | Longer than the active D33 receipt-reconciliation SLO or five consecutive lookup failures, whichever occurs first                                          | Web Studio operations             | Keep editing frozen; surface cause-owned recovery; page the owner; never advise blind retry                                                                   |
| Authorization/non-enumeration failure                                                   | Any unauthorized allow or disclosed target/source detail                                                                                                   | Security owner                    | Disable D82/history links; invoke incident response; repair grants/RLS/privileged parity; rerun hostile suite                                                 |
| Public/Vercel/money/provider side effect                                                | Any correlated call or changed public snapshot                                                                                                             | Owning integration + D1/D2 owner  | Disable D82; contain external effect; reconcile state; repeat zero-effect qualification                                                                       |
| Transaction latency/lock/retry contention                                               | Exceeds the active Production Capacity Profile threshold for two consecutive evaluation windows                                                            | Database/platform owner           | Pause cohort expansion; inspect plans/lock order/history-summary fencing; tune from measured evidence only                                                    |
| Eligibility-proof unavailable rate                                                      | Exceeds the active D33 availability/error-budget threshold for two consecutive windows                                                                     | D2 operations owner               | Pause expansion; diagnose projection/reader lag; retain fail-closed behavior; do not weaken proof                                                             |
| Staff abandonment/support after address review                                          | More than 5% of at least 20 observed eligible handoffs                                                                                                     | Web Studio product/UX owner       | Review recordings/support causes; improve copy/field recovery inside existing surface; do not add a workflow without a new decision                           |

## Ruthless synthesis — strongest path forward

### Resolved before recording D82

1. Replace the false “never historical” phrase with the precise Draft-only
   Path Claim definition and distinguish private History from route effects.
2. Accept Option 1 only for complete positive D2 provenance over the entire
   canonical equivalence class and every claimant.
3. Make source supersession plus a fresh target claimant-ownership occurrence/
   version one D2-owned part of the D80/D81 transaction and receipt; forbid
   source identity transfer.
4. Keep one editable PageShell placement group and one CTA with truthful
   Core-scoped provenance, complete URL, distinct errors, and not-live result.
5. Keep current runtime unavailable; admit descendant effects only through
   ADR-0204's exact complete closure and ordinary-D2 fallback.

### Required in consolidated spec/design before implementation

1. Map D82-R1-R25, I1-I24, AC1-AC60, states, monitors, and exact terminology
   into glossary, ADRs, OpenSpec, design, tasks, tickets, tests, D33, and
   release evidence.
2. Define D2's complete route-effect taxonomy, canonical equivalence rules,
   namespace-wide structural exclusivity, append-only claim succession, and
   versioned eligibility projection/summary.
3. Extend Phase 12 effects, D12 History/restore, D80/D81 plan/receipt, and D33
   scenario without widening D23 Copy-to-Site.
4. Specify additive migration, unknown-history policy, old-writer fence,
   qualified Payload owner port, mixed-version boundary, and rollback readers.
5. Carry ADR-0204's closure/head/claim, bounded-capacity, UX, and fallback
   contract before admitting dependent descendant paths; do not invent subtree
   transfer in implementation tickets.

### Implementation safeguards required before activation

1. One authoritative PostgreSQL transaction with deterministic locking,
   expected owner/head/lease CAS, DB exclusivity, failpoints, and receipt-first
   replay.
2. Same-scope keys/FKs/checks/restrictive lifecycle plus equality-leading
   indexes and production-shaped query/lock evidence.
3. Least grants, RLS old/new checks, non-enumeration, privileged/Payload parity,
   and native bypass/suffix/restore suppression.
4. Accessible PageShell states, input preservation, permission-safe errors,
   weak-network reconciliation, and representative staff comprehension.
5. Zero public/Vercel/SEO/money/provider effect and immutable private History/
   audit proof.

### Monitor rather than build now

- Observe the named staff-friction signal; do not add generic transferable
  claims, bulk tools, or reservations from anecdote.
- Observe the named D33 latency/lock/retry and proof-availability signals; do not add a queue,
  saga, global lock service, or full-history scan without demonstrated failure
  of the bounded design.
- Observe the named public/provider side-effect signal; do not duplicate
  Payload's version store or D2's route ledger.

Every monitored item has the named signal, threshold, owner, and response in
the table above. Nothing safety-critical is deferred to monitoring.

## Traceability and repository status

The permanent architectural record is
[ADR-0203](../../adr/0203-atomic-adoption-of-exact-draft-only-page-path-claims.md).
It narrows the exact source-draft collision in ADR-0201/0202 and D80/D81 while
depending on the proposed Phase 23 D1/D2/D12/D23 contracts at PR #1340's
reviewed head.

At the review snapshot, local `HEAD` and fetched `origin/develop` remained
`7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. Phase 22 PR #1323 remained
`OPEN/BLOCKED` at `70c50e8c97556c43be5543332fb0993b468b90ab`; Phase 23 PR
#1340 remained `OPEN/BLOCKED` at
`9069dcad67f9630323474ca5ee8bcc85ca7bf0f6`.

No runtime, schema, migration, Supabase policy, OpenSpec delta, ticket, Vercel/
DNS/TLS/Stripe request, deployment, or production state changed. D82 is
accepted documentation intent only and remains unavailable until its substrate
and proof gates, plus ADR-0204 for descendant-dependent candidates, pass.

## D84 resolution and branch closure

ADR-0205/D84 settles the fresh target position through positive D2 reviewed-
boundary or known append-last provenance, trusted Parent Page/Top-level
resolution, one post-D81/D82/D83 final baseline, and a fresh target order
representation. It never copies the adopted source claim's Placement/order
value. Only sealed predecessor effects may advance affected heads; D84 causes
no additional pre-existing Page parent/order write and preserves final-cohort
relative order. Unknown/stale position provenance uses ordinary D2 review. The
D80-D84 branch has no further founder-level Placement decision.

## References

- [ADR-0205 - Reviewed sibling placement with append-last default](../../adr/0205-reviewed-sibling-placement-with-append-last-default.md)
- [Phase 24 D84 adversarial review](./phase-24-d84-reviewed-sibling-placement-adversarial-review.md)
- [ADR-0204 - Atomic source-tree draft-path re-derivation](../../adr/0204-atomic-source-tree-draft-path-rederivation.md)
- [Phase 24 D83 adversarial review](./phase-24-d83-source-tree-draft-path-rederivation-adversarial-review.md)
- [ADR-0203 - Atomic adoption of exact draft-only Page path claims](../../adr/0203-atomic-adoption-of-exact-draft-only-page-path-claims.md)
- [ADR-0202 - Material-purpose Page Handoffs append clean source Working successors](../../adr/0202-atomic-material-page-handoffs-append-clean-source-revisions.md)
- [ADR-0201 - Material Page-purpose changes create independent Pages](../../adr/0201-material-purpose-changes-create-independent-pages.md)
- [Phase 24 D81 adversarial review](./phase-24-d81-atomic-material-page-handoff-adversarial-review.md)
- [Phase 24 D80 adversarial review](./phase-24-d80-material-purpose-new-page-adversarial-review.md)
- [Proposed ADR-0146 - Staged hierarchical public paths](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0146-staged-hierarchical-public-paths-under-coherent-site-generations.md)
- [Proposed ADR-0156 - Working Revisions and active editor](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
- [Proposed ADR-0167 - Exact Site-owned ordinary content](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0167-exact-site-owned-ordinary-content-with-independent-copy-to-site-drafts.md)
- [Payload Drafts](https://payloadcms.com/docs/versions/drafts)
- [Payload Versions](https://payloadcms.com/docs/versions/overview)
- [Payload transactions](https://payloadcms.com/docs/database/transactions)
- [Payload Local API access control](https://payloadcms.com/docs/local-api/access-control)
- [Sanity transactions](https://www.sanity.io/docs/content-lake/transactions)
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html)
- [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [PostgreSQL partial indexes](https://www.postgresql.org/docs/current/indexes-partial.html)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase database functions](https://supabase.com/docs/guides/database/functions)
- [Vercel domains](https://vercel.com/docs/domains/working-with-domains)
- [Vercel rewrites](https://vercel.com/docs/routing/rewrites)
- [Next.js trailing-slash behavior](https://nextjs.org/docs/app/api-reference/config/next-config-js/trailingSlash)
- [Google URL-change guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- [WCAG 2.2 Redundant Entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html)
- [WCAG 2.2 On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html)
- [WCAG Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)
- [WCAG Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
