# Phase 24 D84 — Reviewed sibling placement with append-last default adversarial review

Date: 2026-09-01  
Decision: D84  
Founder answer reviewed: **Option 1 — Preserve an explicit valid position;
otherwise append last.**

## Outcome first

**Final disposition: Accept with required amendments.**

The product outcome is current and proportionate: preserve deliberate staff
information-architecture work when Core can positively prove it, while keeping
the common case a quiet append-last default. It avoids the friction of a
mandatory position chooser and the cleanup burden of always discarding an
already-reviewed position.

The raw wording is unsafe without the following integration amendments:

1. A saved order value does not prove that staff explicitly chose it. Proposed
   D2 owns sibling order but currently records no explicit-versus-default
   provenance.
2. “Otherwise append last” cannot include missing, legacy, unreadable,
   contradictory, or corrupt provenance. Those states are unknown, not a
   positively known default, and must use ordinary D2 position review.
3. Parent Page wording alone omits D80's legitimate **Top level** choice; D2
   must resolve it from trusted Site context to the existing root placement
   owner, never from null or caller input.
4. Explicit boundary shapes, append-last, and source cleanup must share one
   closed post-D81/D82/D83 baseline, including first/end/empty concurrency.
5. “No source head change” would wrongly prohibit required D81/D83 successors;
   the invariant is no D84-caused collateral parent/order write outside the
   sealed owner-qualified effect manifest.
6. Structural cohort evaluation, per-sibling detail visibility, and retained
   boundary-ID privacy are separate authorization/lifecycle concerns.

The corrected answer is:

> **D84 — Reuse D2's reviewed-position-or-append-last new-Page placement
> contract.** In the D80-D84 material-purpose handoff, preserve a sibling
> position only when the exact acknowledged source Placement candidate is
> linked to immutable D2 command provenance proving that staff explicitly
> selected one closed same-parent start, between, end, or empty-cohort boundary.
> A visible **Top level** choice resolves server-side to the existing Site-root
> placement owner/root Page; null never means root or boundary. Derive one
> post-D81/D82/D83-clean, pre-target-insert sibling cohort, validate the
> explicit boundary against it, and generate a fresh target order value inside
> the one D80-D84 transaction. Never copy or infer intent from a source/provider
> rank.
>
> Use **append last** only when D2 provenance positively records the ordinary
> default or no explicit sibling-position choice. Resolve the current tail from
> the same final baseline at commit. A stale explicit boundary requires review and
> never silently appends; unknown provenance also requires review. No immutable
> revision is mutated; only sealed D81/D82/D83 owner effects may change affected
> source-clean/derived state; D84 preserves pre-existing relative order in the
> resulting final cohort. Navigation,
> URLs, public generation, external providers, donors, and money remain
> unchanged.

This decision adds one small closed semantic provenance contract to D2. It
adds no D84-specific ordering engine, table, workflow, capability, selector,
provider rank, or public behavior.

## Ruthless synthesis — what actually must happen

### Required amendments applied before recording

1. Replace inferred “explicit” order with positive immutable D2 placement-
   command provenance.
2. Split three cases: qualified explicit boundary, positively known append-last
   default, and unknown provenance requiring review.
3. Resolve Parent Page/Top level from trusted D2 state and use closed, tagged
   start/between/end/only boundaries with no overloaded nulls.
4. Evaluate both explicit placement and append-last against one locked final
   sibling cohort after the qualified D81/D82/D83 effects, not the raw list.
5. Make append-last a semantic commit-time outcome, not a preflight tail Page
   identity that stales on harmless concurrent appends.
6. Stale only the narrow explicit boundary; unrelated sibling/title edits that keep
   the exact parent/boundary/adjacency do not force re-review.
7. Generate a fresh target order value; permit only sealed D81/D82/D83 owner
   effects on existing heads and no D84-caused collateral parent/order write.
8. Treat boundary Page IDs as minimized, tombstonable handoff evidence, never
   ongoing target-following or purge-blocking relationships.
9. Separate full structural calculation from per-sibling detail disclosure and
   provide cause-neutral, non-enumerating copy when detail is unavailable.
10. Keep the UI to one read-only consequence row and one existing handoff CTA.

### Requirements that belong in the spec/design

- D2's general new-Page placement command must define the closed semantic
  modes and immutable provenance needed by ordinary create/move and D84.
- D12 must retain the exact acknowledged source Placement candidate/head and
  causative D2 placement receipt without making audit data current authority.
- the sealed material-purpose handoff plan and semantic receipt must include the chosen D84 mode,
  explicit boundary IDs when applicable, ordering-contract version, actual
  committed boundary/result, and one idempotent effect.
- D33 must qualify sibling-cardinality/contention, indexed tail/gap lookup,
  lock/transaction budgets, collision handling, and any adapter compaction.
- Proposed D2 OpenSpec must add explicit-gap, known append-last, unknown-
  provenance, stale-gap, same-gap race, append race, and Navigation/public non-
  effect scenarios before implementation tickets.

### Implementation safeguards, not new product choices

- same-scope structural references and query-shaped indexes;
- deterministic locks and complete-transaction retry;
- no client/provider rank or caller-selected scope/actor/authorization;
- no raw Payload reorder endpoint or lazy provider migration;
- least grants plus RLS `USING`/`WITH CHECK` and privileged-path parity;
- no unbounded sibling scan/rewrite in the handoff;
- receipt reconciliation after an unknown transport result;
- mixed-version readers and an old-writer/native-endpoint fence; and
- outcome-oriented tests, not provider-key snapshots.

### Risks that may be monitored only after proof

Only admitted capacity/latency and stale-review burden may be operationally
monitored after their non-null launch thresholds are evidence-qualified.
Wrong position, inferred unknown provenance, collateral sibling mutation,
cross-scope/unauthorized success, duplicate effects, unauthorized detail, and
public/external/money effects are zero-tolerance release blockers.

## Fact classification

| Classification                   | Finding                                                                                                                                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository fact                  | Current `develop` `pages.ts` has tenant-scoped editorial/layout fields, a scalar slug, and provider drafts but no Site/locale Placement lineage, parent, sibling order, D2 provenance, or D80-D84 command.    |
| Repository fact                  | Proposed ADR-0146 and Web Studio D2 assign parent, local segment, and sibling order to immutable Page Placement Revisions, separate order from URL/Navigation, but do not define explicit/default provenance. |
| Repository fact                  | Proposed D12 treats structural Placement as a separate deliberate Working Revision/head/lease domain rather than Editorial autosave.                                                                          |
| Repository fact                  | Installed Payload is `4.0.0-internal.1f9ae9a`; its generic orderable implementation uses hidden fractional keys and provider-native reorder/migration behavior. Pages do not enable it.                       |
| Verified primary-source fact     | Current Payload docs support start/end/between fractional-key generation; they do not prove staff intent, sibling scope, immutable Core Placement, or safe handoff concurrency.                               |
| Verified primary-source fact     | Umbraco appends newly created Pages and offers a separate Sort action; WordPress and Craft expose hierarchy/order separately; Shopify reorders only named moved items and preserves other relative order.     |
| Verified primary-source fact     | Figma documents efficient fractional insertion, growing keys, same-gap concurrent insert risk, unique server assignment, and atomic parent-plus-position meaning.                                             |
| Verified primary-source fact     | WCAG 2.2 requires a non-drag single-pointer alternative in addition to keyboard accessibility; WAI's rearrangeable example explicitly warns against untested production reuse.                                |
| Product judgment                 | Preserving positively proved placement intent plus a known append-last default is a Core choice. No external product proves this exact D80-D84 handoff policy.                                                |
| Assumption                       | Some acknowledged material-purpose candidates will contain genuinely explicit sibling placement. Usage evidence must measure this; absence does not weaken the safe append/review behavior.                   |
| Unresolved implementation detail | Exact rank encoding, lock granularity, current-head schema, and compaction remain with accepted D2/D33 design and exact-adapter qualification.                                                                |

## Current behavior, intended behavior, and permanent path

| Layer           | Current behavior                                                     | Intended/proposed behavior                                     | Permanent D84 path                                                                              |
| --------------- | -------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Page model      | Tenant-scoped mutable Payload Page with scalar slug; no D2 placement | Stable Page plus exact-locale immutable Placement lineage      | D84 unavailable until accepted D1/D2/D12 substrate exists                                       |
| Sibling order   | No Core Page-tree sibling order                                      | D2 Placement Revision owns order and makes reorder URL-neutral | Reuse D2's general semantic new-Page placement command                                          |
| Explicit intent | None                                                                 | Not yet specified by proposed D2                               | One immutable D2 command provenance branch: explicit boundary, known append default, or unknown |
| Provider        | Payload private CMS and current generic list                         | Exact Payload v4 cohort is evidence-gated                      | Provider rank/key may be an adapter output only; raw orderable path is fenced                   |
| Authorization   | Broad current Tenant staff collection update                         | Proposed Phase 12 effect evaluation and D2/D12 heads           | Reauthorize exact target Placement and trusted scope; no D84 capability                         |
| Public behavior | Current provider draft/publish and published reader                  | D1 coherent Public Site Generation                             | D84 writes no D1 head and changes no public/Navigation output                                   |

Current source is not grandfathered design. The permanent implementation begins
from the proposed owner model, amends its missing semantic provenance, and then
qualifies the exact runtime rather than extending today's scalar Page row.

## Primary research and strongest alternative

### What the evidence supports

- Payload's current Collection documentation says `orderable` uses fractional
  indexing and exposes generators at start, end, and between. Frozen-install
  inspection of the pinned internal cohort adds hidden indexed order fields,
  end-key behavior, and provider reorder/migration mechanics. That is useful
  implementation evidence that stock ordering is not the D2 authority required
  here; the repo's different vendored Payload 3.77.0 index is comparison
  evidence only.
- Figma's production write-up supports fractional indices as a simple ordering
  representation, but explicitly identifies same-index concurrent insertion
  and growing-key limitations. Core uses a centralized server transaction, so
  importing CRDT or multiplayer machinery would be disproportionate.
- Umbraco's current documentation proves append-last is a familiar, usable
  default; Craft and WordPress prove hierarchy/order are explicit concepts;
  Shopify demonstrates limited changed-item mutation. None should be copied as
  Core's database or authorization model.
- PostgreSQL constraints, locking, and complete serialization/deadlock retry
  support the required strict order. A read-before-write check or Page-ID tie-
  breaker does not.
- Supabase guidance confirms that table grants and RLS are both required and
  privileged roles bypass RLS. Core therefore keeps one trusted command and
  repeats authorization through every privileged path.
- W3C and Atlassian guidance support named non-drag controls, retained focus,
  complete status announcements, and no drag-only tree. The handoff itself
  needs no drag interaction.

### Reproducible installed Payload evidence snapshot

- [`package.json`](../../../package.json) and [`bun.lock`](../../../bun.lock)
  pin `payload@4.0.0-internal.1f9ae9a`; the lock integrity is
  `sha512-Eev+nlYltrR27qaIPMAwHQxmXhpe2aTjshiJkUbeZSFChyyF0xroDDAlH8BRV3IruCrcNPJcvG4+YIVw1uds1g==`.
- After the frozen install used for this review,
  `dist/config/orderable/index.js` and its source map have SHA-256 values
  `fb0bdf34988d3136166f4d5a9a3c5ff0e54714b1f395fb0bafd311f6664e8f77`
  and `a901001aa18e7984dc238be47bf83b8a98a2fe331837ad22c10e898fb86528fe`;
  the map's embedded TypeScript source hashes to
  `1f0bd5079d13fe941b8e8c1a8174c8bade8cc510d528befaa2d8a56b419d3c8e`.
- Installed `fractional-indexing.js` and its map hash to
  `c2fb28659fd457fbf21e941f1c7ef5fbbb123a73f2346d708187061eebd64556`
  and `b830e0663995a63e04e8ebec98810accacdb266ba4526cc62a3161c89825e312`;
  its embedded source hashes to
  `01e1f76d40b9bca71e4f900e2fdb406eb204796dc42bbb5d41fb3a413f8288bb`.
- Any dependency change invalidates this snapshot until a frozen install,
  source inspection, hash capture, and D2 adapter contract requalification
  reproduce the new artifact. These hashes prove inspected bytes, not semantic
  qualification by themselves.

### Strongest plausible alternative: always append last

Always append last is the strongest minimal alternative. It is simpler to
explain, requires no explicit-position provenance, and matches Umbraco's proven
new-Page default. It becomes the safe behavior when D2 positively records its
default branch.

It is not the best universal answer because it discards deliberately reviewed
information architecture and can create an immediate reorder task. Option 1 is
superior only when D2 can positively prove explicit intent. If that general D2
contract is not accepted or implemented, D84's preservation branch is
unavailable; Core must use known append-last or ordinary D2 review, never
guess.

## Category-by-category adversarial review

Every category below was evaluated independently. **Material concern exists in
all 22 categories**, but none requires rejecting the corrected decision.
Unless a row says otherwise, its effect is **narrows Option 1 and requires the
named amendment before acceptance**: the raw answer is not implementable, the
corrected answer remains valid, and the last column identifies the permanent
fix plus exact requirement/acceptance hook. “Severity / likelihood / evidence”
states the basis; “What could go wrong and why it matters” states the failure
and consequence. No concern is deferred to monitoring as a substitute for its
specified prevention.

### 1. Problem validity, necessity, and alternatives

**Material concern exists: Yes.**

| Concern                                                | What could go wrong and why it matters                                      | Severity / likelihood / evidence                                                                              | Effect, permanent fix, and exact amendment                                                     |
| ------------------------------------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| D84 solves a handoff symptom with a second order model | Ordinary Page create/move and D84 could disagree about position and intent. | **High / High.** D2 already owns sibling order; proposed D2 lacks only provenance.                            | **Narrows Option 1.** Reuse the general D2 placement command. **Add D84-R1/R2/R28.**           |
| “Explicit” is inferred from current rank               | Defaults/imports become fabricated staff intent.                            | **Critical / High under raw wording.** Rank records outcome, not cause.                                       | **Changes the answer.** Require positive D2 receipt provenance; unknown blocks. **D84-R3-R6.** |
| Strong alternative is not compared                     | Always append may be better if provenance cost exceeds benefit.             | **Medium / Medium.** Umbraco proves the default is viable; actual D84 explicit-position frequency is unknown. | Keep append as the proven default and measure use; no separate system. **D84-R2/R4/R23.**      |

### 2. Brittleness

**Material concern exists: Yes.**

| Concern                                        | What could go wrong and why it matters                       | Severity / likelihood / evidence                                                                         | Effect, permanent fix, and exact amendment                                      |
| ---------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Coarse generation invalidates unrelated edits  | Staff repeat reviews after harmless sibling/title changes.   | **High / High** in active trees. Stable IDs and adjacency are narrower than whole-parent revision churn. | Dependency-scope freshness to exact gap; labels may refresh. **D84-R8/R9.**     |
| Frozen preflight tail                          | Default append becomes stale whenever another Page is added. | **High / High.** “Append” is a relative commit-time outcome.                                             | Resolve current tail under lock; replay uses receipt. **D84-R11/R16/R17.**      |
| Rank-only anchor misses interposed sibling     | Target lands in a gap staff no longer reviewed.              | **Critical / Medium.** Fractional values do not establish semantic adjacency.                            | Bind stable boundaries and re-prove adjacency. **D84-R7/R8/R10.**               |
| Append uses pre-clean rather than final cohort | Source cleanup can make the resolved tail wrong.             | **Critical / Medium.** D81/D83 can change current Placement heads/topology in the same transaction.      | Derive one locked post-predecessor baseline for both modes. **D84-R8/R11/R15.** |

### 3. Technical debt

**Material concern exists: Yes.**

| Concern                                | What could go wrong and why it matters                                     | Severity / likelihood / evidence                                                                 | Effect, permanent fix, and exact amendment                                      |
| -------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| D84-specific flag/table/head           | Dual provenance and order authorities drift across every future migration. | **High / Medium.** D2/D12 already have command/head/receipt seams.                               | Extend existing D2 command evidence only; no new authority. **D84-R1/R14/R22.** |
| Provider-shaped rank leaks into domain | Payload upgrades become schema/product migrations.                         | **High / High until contained.** Pinned internal cohort and public docs are not identical proof. | Provider-neutral D2 adapter and contract tests. **D84-R12/R22/R27.**            |

### 4. Edge cases

**Material concern exists: Yes.**

| Concern                                                                          | What could go wrong and why it matters                         | Severity / likelihood / evidence                                                                         | Effect, permanent fix, and exact amendment                                                             |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Empty/one-child/first/between/end/Top-level ambiguity                            | Null can mean missing, boundary, empty cohort, or root.        | **High / High collectively.** D80 permits Parent Page or Top level and every cohort can hit these cases. | Trusted root resolution plus tagged start/between/end/only; no overloaded null. **D84-R2/R7/R18-R19.** |
| Source clean restores inside candidate gap                                       | Target position is ambiguous: before or after restored source. | **High / Medium.** D81 changes the final topology before insert.                                         | Simulate post-clean cohort; stale and review. **D84-R8/R10/R15.**                                      |
| Deleted/Trashed/reparented/hidden anchors, duplicate titles, locale/parent drift | Result can be wrong or disclose private structure.             | **Critical / Medium.** These are normal lifecycle/permission events.                                     | Reauthorize stable IDs/scope; disambiguate only with authorized context. **D84-R8/R18/R19/R25.**       |
| Rank collision/precision exhaustion                                              | Strict order fails or triggers mass rewrite.                   | **High / Low-to-medium after qualification.** Figma and Payload document fractional mechanics/limits.    | Collision retry or owner repair; no unbounded rebalance. **D84-R17/R23.**                              |

### 5. Footguns

**Material concern exists: Yes.**

| Concern                                                            | What could go wrong and why it matters                                         | Severity / likelihood / evidence                                                  | Effect, permanent fix, and exact amendment                                   |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Copy source key, use array index, `last + 1`, or Page-ID tie-break | Creates collisions or a deterministic but unreviewed result.                   | **Critical / Medium.** Easy implementation shortcuts; none prove intent.          | Server generates fresh strict order; duplicates fail. **D84-R6/R12/R17.**    |
| Raw Payload orderable/Local API                                    | Provider access/default-migration semantics bypass D2 and immutable revisions. | **Critical / Medium.** Local API can bypass access unless explicitly constrained. | Fence native endpoint and require Core command/adapter. **D84-R18/R20/R22.** |
| Silent stale-to-last fallback                                      | Staff-approved placement changes without consent.                              | **High / High if not explicit.** The UI would still appear successful.            | Stale explicit always review-required. **D84-R10/R24.**                      |

### 6. Tenant safety

**Material concern exists: Yes.**

| Concern                                     | What could go wrong and why it matters                                     | Severity / likelihood / evidence                                                                                           | Effect, permanent fix, and exact amendment                                                                                  |
| ------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| ID-only parent/neighbor resolution or cache | Cross-Tenant/Site/locale Page data leaks or wrong-tree insertion.          | **Critical / Medium without composite scope.** Core scope is not Page ID alone.                                            | Trusted full scope, composite relationships/keys, poison tests. **D84-R18-R20.**                                            |
| Permission-filtered list defines adjacency  | Hidden siblings disappear from the server calculation.                     | **Critical / Medium.** UI visibility is not tree authority.                                                                | Server uses complete authorized structural cohort; projection only redacts detail. **D84-R8/R18/R25.**                      |
| Structural calculation implies content read | Hidden ministry Page details leak merely because staff can place a target. | **Critical / Medium without separation.** Placement authority and per-Page content/detail authority are different effects. | Owner port evaluates full cohort; detail/specific cause is separately gated and cause-neutral when absent. **D84-R18/R25.** |

### 7. Database, RLS, and authorization safety

**Material concern exists: Yes.**

| Concern                              | What could go wrong and why it matters                                         | Severity / likelihood / evidence                                                          | Effect, permanent fix, and exact amendment                                                 |
| ------------------------------------ | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Read-before-write or weak uniqueness | Two same-gap/append commands can create duplicate order semantics.             | **Critical / Medium.** PostgreSQL requires constraints/locks/retry, not app checks.       | One transaction, deterministic lock, strict current order, retry. **D84-R15/R17/R19/R23.** |
| Allowed update transforms scope      | `USING` alone can move an allowed row into a forbidden Tenant/parent.          | **Critical / Medium.** Supabase distinguishes old-row and new-row policies.               | Both `USING`/`WITH CHECK`, composite FKs, caller scope ignored. **D84-R18-R20.**           |
| Privileged bypass disagrees          | Payload/service/import/support can insert unsafe order despite browser denial. | **Critical / High unless tested.** Service roles bypass RLS; Payload has separate access. | Same effect proof on every path; no direct DML. **D84-R20/R22/R27.**                       |
| Historical rows mutable or cascaded  | Later fixes rewrite what staff reviewed.                                       | **Critical / Low-to-medium after constraints.** D12 requires immutable revisions.         | Append-only evidence, restrictive deletion, no ordinary update/delete. **D84-R13/R21.**    |

### 8. Overengineering

**Material concern exists: Yes.**

| Concern                                                  | What could go wrong and why it matters                                      | Severity / likelihood / evidence                                                   | Effect, permanent fix, and exact amendment                                             |
| -------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| CRDT/LexoRank service/async workflow/per-Tenant strategy | Solves Figma/Shopify-scale collaboration instead of one server transaction. | **Medium / High temptation.** Core does not need offline concurrent replicas here. | One closed D2 command and qualified adapter; no policy. **D84-R1/R14/R23/R28.**        |
| Mandatory picker                                         | Adds control, data loading, and validation for a rare edge.                 | **Medium / High.** Most products permit later order adjustment.                    | Read-only result; ordinary D2 selector only for deliberate change/repair. **D84-R24.** |

### 9. UX/UI and user friction

**Material concern exists: Yes.**

| Concern                                            | What could go wrong and why it matters                                                       | Severity / likelihood / evidence                                                                                     | Effect, permanent fix, and exact amendment                                                              |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Staff confuse Page tree with Navigation/live order | They expect public menu changes or fear moving the source.                                   | **High / High without exact copy.** D2 and D4 are separate.                                                          | Always-visible explicit labels and non-effect sentence. **D84-R24/R26.**                                |
| Another required choice                            | Rare handoff becomes slow and cognitively heavy.                                             | **High / High.** Existing Parent/title/path review is already consequential.                                         | No new mandatory control/confirmation. **D84-R24.**                                                     |
| Drag-only or dense sibling list                    | Mobile, switch, speech, and keyboard users cannot complete work; large lists are slow.       | **High / High if copied from provider.** WCAG 2.5.7 requires non-drag pointer alternative.                           | Reuse named D2 menu/form, load/search on demand, 44px targets. **D84-R25.**                             |
| Toast-only/stale/focus theft                       | Staff retry, lose inputs, or miss that nothing moved.                                        | **High / Medium.** W3C requires textual errors/status and logical focus.                                             | Persistent messages, one linked error-summary focus, receipt recovery. **D84-R16/R24/R25.**             |
| First/Last/Only or Top level hides intent          | Staff cannot tell reviewed end from default append or see “under Home” instead of top level. | **High / High without distinct copy.** These states have different concurrency semantics and D80 promises Top level. | Exact reviewed/default descriptions plus First/Last/Only and “at top level” labels. **D84-R7/R24-R25.** |

### 10. Source of truth, ownership, and domain invariants

**Material concern exists: Yes.**

| Concern                                                  | What could go wrong and why it matters                                    | Severity / likelihood / evidence                                                          | Effect, permanent fix, and exact amendment                                                                 |
| -------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Rank, anchor, provider row, plan, and projection compete | Later edits can drag target or re-interpret history.                      | **Critical / High if unspecified.** ADR-0146 names D2 Placement; D4/D1 are separate.      | D2 owns committed order; provenance is bounded; plan/projection derived. **D84-R1/R12/R14/R26.**           |
| Audit log becomes write authority                        | Log retention or repair can change eligibility.                           | **High / Medium.** Technical/audit evidence is not a current head.                        | Link to immutable causative D2 receipt, but mutate only through D2 head/command. **D84-R3/R14/R21.**       |
| Blanket no-source-head rule conflicts with D81/D83       | A correct cleanup/derived successor is rejected or trips the kill switch. | **Critical / High under the draft.** D81/D83 explicitly advance qualified affected heads. | Allow only the sealed predecessor manifest; D84 adds no collateral parent/order write. **D84-R8/R13/R15.** |

### 11. Hidden coupling

**Material concern exists: Yes.**

| Concern                                      | What could go wrong and why it matters                           | Severity / likelihood / evidence                                                                   | Effect, permanent fix, and exact amendment                                                     |
| -------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Order changes URL/Navigation/public listing  | One private placement unexpectedly changes visitors.             | **Critical / Medium without boundaries.** Proposed D2 says reorder is URL-neutral and D4 separate. | Zero public/D4 effect; future hierarchy listing must explicitly consume D1 order. **D84-R26.** |
| Long-lived anchors follow neighbors          | Deleting/reordering a neighbor moves target without a D2 action. | **High / Medium.** Anchors are placement command intent, not constraint graph.                     | Receipt-only provenance after commit. **D84-R14.**                                             |
| Provider compaction becomes business history | Maintenance noise appends or mutates Page revisions.             | **High / Medium over time.** Fractional keys may need maintenance.                                 | Qualify semantics-preserving adapter maintenance separately. **D84-R12/R21-R23.**              |

### 12. Failure modes

**Material concern exists: Yes.**

| Concern                                             | What could go wrong and why it matters                  | Severity / likelihood / evidence                                                                                       | Effect, permanent fix, and exact amendment                                                                                        |
| --------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Gap changes after validation                        | Target commits into unreviewed position.                | **Critical / Medium.** Concurrent inserts/reorders are expected.                                                       | Lock/revalidate exact gap in transaction. **D84-R8/R15/R17.**                                                                     |
| Target position resolves before predecessor effects | Append/start/end can commit against the wrong topology. | **Critical / Medium.** Source cleanup may enter/leave the parent or tail.                                              | Determine D81-D83 effects and final baseline before D84 resolution; physical reorder needs equivalence proof. **D84-R8/R11/R15.** |
| Commit succeeds, response lost                      | Blind retry creates another target or re-cleans source. | **Critical / Medium.** Network/runtime ambiguity is normal.                                                            | Durable semantic idempotency and receipt reconciliation. **D84-R16.**                                                             |
| Provider hook/adapter fails mid-command             | Source/target/receipt diverge.                          | **Critical / Low-to-medium after transaction qualification.** Payload nested work requires shared transaction context. | One same-database transaction, no external call, failpoints. **D84-R15/R22/R26.**                                                 |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern exists: Yes.**

| Concern                                                    | What could go wrong and why it matters                      | Severity / likelihood / evidence                                                        | Effect, permanent fix, and exact amendment                                       |
| ---------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Two same-gap inserts both succeed                          | Both claim a gap that existed only before the first insert. | **Critical / Medium.** Fractional generators alone do not serialize semantic adjacency. | One wins; loser stales/reviews. **D84-R8/R10/R17.**                              |
| Two appenders collide or over-stale                        | Duplicate key or needless human review.                     | **High / Medium.** Append intent can safely serialize.                                  | Resolve tail inside each commit; retry complete transaction. **D84-R11/R17.**    |
| Replay recalculates newer tail                             | Same command changes meaning over time.                     | **Critical / Medium.** Transport idempotency alone is insufficient.                     | Semantic key and original receipt/result. **D84-R16.**                           |
| Later authorized reorder changes historical interpretation | Staff receipt appears false.                                | **High / Medium.** Order is versioned over time.                                        | New D2 revision for later move; D84 receipt remains historical. **D84-R14/R21.** |

### 14. Data integrity risks

**Material concern exists: Yes.**

| Concern                                              | What could go wrong and why it matters                        | Severity / likelihood / evidence                                                                                              | Effect, permanent fix, and exact amendment                                                                        |
| ---------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Duplicate rank/head or orphan parent                 | Tree becomes nondeterministic or cross-scope.                 | **Critical / Medium.** Current provider hidden order field is not the required constraint.                                    | Strict current order, one target head, composite parent refs. **D84-R17/R19/R21.**                                |
| D84 rewrites unrelated rows or forbids valid cleanup | Immutable history drifts, or legitimate D81/D83 effects fail. | **Critical / Medium under blanket/noisy implementations.** D84 needs one insert but predecessor owners may append successors. | No immutable mutation; only sealed D81-D83 effects; no D84-caused collateral parent/order write. **D84-R13/R23.** |
| Migration invents provenance                         | Old adjacency is misrepresented as staff review.              | **High / High if backfill is guessed.** Current rows cannot prove cause.                                                      | Unknown quarantine/review; no inferred backfill. **D84-R5/R27.**                                                  |

### 15. Security and privacy risks

**Material concern exists: Yes.**

| Concern                                                         | What could go wrong and why it matters                                               | Severity / likelihood / evidence                                                               | Effect, permanent fix, and exact amendment                                                                                    |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Neighbor labels enumerate restricted ministry/member-care Pages | Structural titles/paths can reveal sensitive programs or locations.                  | **Critical / Low-to-medium after controls.** Visibility differs by role.                       | Permission-safe detail, minimized logs/receipt, non-enumerating error/timing. **D84-R18/R25.**                                |
| Source editor places target under unauthorized parent           | Existing source access escalates create/placement authority.                         | **Critical / Medium.** D80 requires distinct effects.                                          | Reauthorize current target and parent Placement effect at commit. **D84-R18/R20.**                                            |
| Retained boundary IDs outlive privacy/purge policy              | Historical ministry relationships leak or a permanent FK blocks authorized deletion. | **High / Medium without lifecycle rules.** D81 already governs handoff retention/hold/privacy. | Minimize/tombstone under `material_page_handoff`; no purge-blocking neighbor FK; test export/backup/restore. **D84-R14/R21.** |

### 16. Scalability and performance risks

**Material concern exists: Yes.**

| Concern                                     | What could go wrong and why it matters                    | Severity / likelihood / evidence                                    | Effect, permanent fix, and exact amendment                                                  |
| ------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Full sibling scan/renumber/lock             | Large tenants time out and hot parents block all editing. | **High / Medium.** Fractional positioning exists to avoid this.     | Indexed anchor/tail lookup, bounded locks, no synchronous rebalance. **D84-R23.**           |
| Rank grows/collides beyond qualified limits | Insert fails unpredictably at scale.                      | **High / Low-to-medium.** Figma documents growth/same-index issues. | D33 measured profiles and separate adapter maintenance; no invented limit. **D84-R17/R23.** |
| UI downloads whole tree                     | Mobile/low-bandwidth staff cannot finish.                 | **Medium / Medium.** Only exceptions need a selector.               | Read-only summary; on-demand search/pagination. **D84-R24/R25.**                            |

### 17. Operational burden

**Material concern exists: Yes.**

| Concern                                                   | What could go wrong and why it matters         | Severity / likelihood / evidence                                   | Effect, permanent fix, and exact amendment                                             |
| --------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Opaque rank repair becomes support work                   | Self-service requires tribal SQL knowledge.    | **High / Medium.** Provider keys are not meaningful staff actions. | Product-owned D2 review/repair and receipt; no direct DB workflow. **D84-R5/R22/R23.** |
| Partial or unknown outcome requires manual reconciliation | Staff repeat the action or abandon saved work. | **High / Medium.** Rare paths still need clear recovery.           | Atomic command, persistent status, semantic receipt lookup. **D84-R15/R16/R24.**       |

### 18. Observability and auditability gaps

**Material concern exists: Yes.**

| Concern                              | What could go wrong and why it matters                          | Severity / likelihood / evidence                                              | Effect, permanent fix, and exact amendment                                                      |
| ------------------------------------ | --------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| “Page created” lacks placement proof | Support cannot distinguish UX misunderstanding from corruption. | **High / High without semantic receipt.** D81 already owns business evidence. | Receipt binds mode, provenance, actual result, actor/scope, and revisions. **D84-R14-R16/R28.** |
| Raw titles/ranks in broad logs       | Private structure leaks and provider coupling hardens.          | **High / Medium.** Logs are broadly consumed/retained.                        | Opaque IDs/keyed tokens in metrics; authorized receipt detail only. **D84-R25/R28.**            |

### 19. Dependency and integration risks

**Material concern exists: Yes.**

| Concern                                                           | What could go wrong and why it matters                            | Severity / likelihood / evidence                                                                            | Effect, permanent fix, and exact amendment                                                                                            |
| ----------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Public or vendored docs assumed to match installed internal build | Upgrade/internal differences silently alter behavior.             | **High / High until qualified.** Repo pins `4.0.0-internal.1f9ae9a`; vendored Payload 3.77.0 index differs. | Frozen-lock integrity plus installed compiled/source-map hashes and contract tests; public/vendor docs support only. **D84-R22/R27.** |
| Provider ordering owns auth/transaction                           | Raw endpoint can bypass Core effect and mutate mutable documents. | **Critical / Medium.** Installed code is provider-generic.                                                  | Suppress/wrap native path; D2 owns semantics. **D84-R18/R20/R22.**                                                                    |
| External call inside transaction                                  | Locks lengthen and ambiguous provider success breaks atomicity.   | **High / Low after prohibition.** D84 needs no provider network effect.                                     | Same-database operation only; zero-call spies. **D84-R15/R26.**                                                                       |

### 20. Migration, rollout, and upgrade risks

**Material concern exists: Yes.**

| Concern                                           | What could go wrong and why it matters         | Severity / likelihood / evidence                                                    | Effect, permanent fix, and exact amendment                                       |
| ------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Old writer omits provenance or writes raw rank    | New code incorrectly preserves unknown intent. | **Critical / High during mixed versions.** Current runtime lacks the field/command. | Expand readers, fence old/native writers, shadow, cohort, contract. **D84-R27.** |
| Rollback deletes target/restores source candidate | Immutable history and later references break.  | **Critical / Low-to-medium after design.** D80-D84 is forward-only.                 | Disable new command; retain readers; repair forward. **D84-R21/R27.**            |
| Exact adapter changes on Payload upgrade          | Fractional/transaction/access behavior drifts. | **High / Medium.** Provider cohort is evidence-gated.                               | Requalify exact adapter before upgrade activation. **D84-R22/R27.**              |

### 21. Testability, traceability, and proof

**Material concern exists: Yes.**

| Concern                                               | What could go wrong and why it matters                                      | Severity / likelihood / evidence                                                            | Effect, permanent fix, and exact amendment                                                                                   |
| ----------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Tests assert key/UI implementation instead of outcome | Refactor passes while order, predecessor effects, or public output changes. | **High / High.** Multiple physical designs can satisfy D2.                                  | Assert final-baseline sequence, manifest-bounded effects, receipt, public non-effect, and staff comprehension. **AC1-AC53.** |
| Missing hostile auth/concurrency/migration matrix     | Happy path misses dominant failures.                                        | **Critical / High without proof.** Same-gap/append and privileged bypass are central risks. | Negative matrix across every path and mixed version. **D84-R18-R20/R27/R28.**                                                |
| Proposed D2 remains stale                             | Tickets implement sibling order without the D84 provenance contract.        | **High / High unless reconciled.** PR #1340 is blocked and unamended.                       | Amend reviewed OpenSpec branch before tickets; trace glossary→ADR→spec→tests. **D84-R28.**                                   |

### 22. Other development hazards

**Material concern exists: Yes.**

| Concern                                             | What could go wrong and why it matters                   | Severity / likelihood / evidence                                          | Effect, permanent fix, and exact amendment                                                       |
| --------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| “Last” sounds permanent                             | Staff think later Pages cannot follow it.                | **Medium / High.** D84 describes one insertion, not an eternal invariant. | Copy says added at end when handoff finishes; later work is ordinary D2. **D84-R11/R24.**        |
| Directional arrows/duplicate/RTL titles obscure gap | Staff approve the wrong order or cannot understand it.   | **High / Medium.** Visual direction is locale-dependent.                  | Explicit After/Before labels, `dir=auto`/bidi isolation, authorized disambiguator. **D84-R25.**  |
| Future public hierarchy consumer appears silently   | Private staff order unexpectedly changes public listing. | **High / Medium.** No current consumer is ratified.                       | Any future consumer explicitly pins released D2 order through D1; D84 creates none. **D84-R26.** |

## Exact normative requirements

### D84-R1 — General D2 owner

D84 SHALL consume D2's general new-Page placement command. It SHALL add no
independent ordering authority.

### D84-R2 — Closed eligible dispositions

A commit-ready plan SHALL contain exactly one positively qualified disposition:
`reviewed_gap` or `append_last`. Unknown provenance is non-ready.

### D84-R3 — Explicit proof

`reviewed_gap` SHALL require immutable D2 placement-command provenance linked
to the exact current acknowledged source Placement candidate, visible Parent
Page/Top-level choice, trusted resolved parent/root placement owner, closed
semantic boundary, actor attribution, and contract version.

### D84-R4 — Known default proof

`append_last` SHALL require D2 provenance positively recording the ordinary
default or that no explicit sibling-position choice was made.

### D84-R5 — Unknown state requires review

Missing, legacy, migrated, unreadable, contradictory, corrupt, or unrecognized
provenance SHALL block and use the existing D2 position review. It SHALL NOT be
treated as a known default.

### D84-R6 — No inference

Rank, array index, current adjacency, title, path, timestamp, provider metadata,
import order, migration guess, drag telemetry, and UI cache SHALL NOT prove
staff intent.

### D84-R7 — Exact parent and boundary representation

D2 SHALL resolve **Top level** from trusted Site context to the existing Site-
root placement owner/root Page before planning; a caller value or null SHALL
NOT mean top level. A reviewed gap SHALL have exactly one tagged closed shape:
`start(successor_page_id)`,
`between(predecessor_page_id, successor_page_id)`,
`end(predecessor_page_id)`, or `only(empty_cohort_marker)`. Null SHALL NOT mean
a boundary, empty cohort, root, or missing data.

### D84-R8 — One final-topology baseline

Under lock, D2 SHALL determine the exact qualified D81/D82/D83 successor-effect
manifest and derive its post-clean, pre-target-insert current-head cohort. Both
dispositions use that baseline: boundary identities must remain same-scope,
same-resolved-parent, ordered, and adjacent; start/end/only must remain the
actual boundary/empty state; append-last resolves that baseline's tail. Source
restoration inside an explicit gap invalidates it. Physical write order may
differ only with proof of the same final semantics.

### D84-R9 — Narrow freshness

Unrelated sibling changes elsewhere, Editorial title/content changes, and a
semantics-preserving provider-key rewrite SHALL NOT alone stale an intact
reviewed gap. Labels may refresh permission-safely.

### D84-R10 — No silent fallback

A stale `reviewed_gap` SHALL never degrade to `append_last`. It becomes review-
required before mutation.

### D84-R11 — Symbolic append at commit

`append_last` SHALL resolve the current tail from D84-R8's final baseline within
the authoritative commit transaction. It means appended at this commit, not
permanently last.

### D84-R12 — Fresh target representation

D2 SHALL generate a fresh target order representation server-side. It SHALL
copy no source/provider key and accept no caller-generated rank.

### D84-R13 — Zero D84-caused collateral parent/order writes

No immutable pre-existing revision SHALL be mutated. Only exact D81/D82/D83
effects in the sealed owner-qualified manifest may advance affected heads or
change source-clean/derived state. Every Page outside that manifest retains its
parent/order. D84 SHALL cause no additional source/descendant write and SHALL
preserve the relative order of every pre-existing member of the resulting final
cohort while inserting only the fresh target.

### D84-R14 — No ongoing anchor relationship

Boundary identities MAY remain minimized authorized plan/receipt provenance
but SHALL create no continuing FK-driven placement, synchronization, or follow-
neighbor behavior. They SHALL follow D81's versioned `material_page_handoff`
retention/privacy/legal-hold/deletion/anonymization/export/backup/tombstone
contract and SHALL NOT create a permanent FK that blocks authorized purge.

### D84-R15 — One short atomic business transition

Target creation/Placement, D81 cleanup, D82 claim effect, D83 closure, receipt,
audit, and internal outbox SHALL commit in one D33-admitted same-database
transaction or none do. Under lock, the command determines predecessor effects,
derives the final baseline, validates/resolves D84, and inserts the target; a
different physical write order requires equivalence proof. No network call
occurs while locks are held.

### D84-R16 — Semantic idempotency and uncertainty

The key SHALL bind the complete D80-D84 semantic request and disposition.
Exact replay returns the original receipt/position; it never recalculates a new
tail/gap. Changed semantics conflict. Unknown responses reconcile first.

### D84-R17 — Concurrency and strict order

Same reviewed-boundary inserts SHALL serialize so at most one consumes the
original between/start/end/only boundary; the loser reviews the changed
boundary. Concurrent appenders SHALL serialize/retry into one deterministic
strict order. Duplicate rank SHALL fail and recompute or abort, never silently
tie-break.

### D84-R18 — Trusted current authorization

Actor, scope, identities, heads, effect epoch, and audit attribution SHALL
derive from trusted context/rows. Commit SHALL reauthorize the existing exact
source and target/resolved-parent Placement effects; D84 creates no capability.
That structural effect permits the owner port to evaluate the complete cohort,
including hidden Pages, but grants no per-Page content/detail read. Specific
labels and stale causes require existing consequence-detail authority;
otherwise the UI uses an equivalent cause-neutral result with uniform status,
shape, and timing.

### D84-R19 — Structural same-scope integrity

Resolved parent/root owner, visible Parent Page/Top-level choice, boundaries,
source/target Page, revisions, heads, plan, receipt, and audit relations SHALL
be constrained to the exact Tenant, environment, Site, and locale with
restrictive lifecycle and non-null trusted ownership.

### D84-R20 — Grants, RLS, and privileged parity

Browser/Data API roles SHALL have no direct D84/order/head mutation grant.
Applicable paths use least grants and correct `USING`/`WITH CHECK`; Payload,
RPCs, functions, views, workers, service/BYPASSRLS, imports, migrations,
support, repair, and AI-assisted paths SHALL enforce the same effect boundary.

### D84-R21 — Immutable history and rollback

Placement revisions and business receipts SHALL be append-only and protected
from ordinary update/delete. Boundary evidence SHALL obey D81's versioned
`material_page_handoff` retention/privacy/hold/deletion/anonymization/export/
backup/tombstone rules. Rollback SHALL stop new commands and repair forward; it
SHALL NOT delete a target or rewrite/restore history.

### D84-R22 — Adapter containment

Raw Payload `orderable`, Local/REST/GraphQL reorder, lazy migration, hook, or
admin-list state SHALL NOT implement D84 authority. The exact installed adapter
must pass Core contract tests and upgrade requalification.

### D84-R23 — Bounded performance

D84 SHALL use indexed boundary/tail/current-scope lookups and SHALL perform no
unbounded sibling scan, synchronous full-set rebalance, or D84-specific queue.
It SHALL pass the active D33 Minimum/Typical/Measured Maximum profile.

### D84-R24 — One calm staff consequence

The existing handoff SHALL always show one read-only Page-tree position row and
retain one primary action. It SHALL add no mandatory picker, RadioGroup,
checkbox, modal, wizard, or second confirmation in the qualified path.

### D84-R25 — Accessibility, internationalization, privacy, and weak networks

Explicit labels, non-drag pointer and keyboard/AT equivalents, logical focus,
status/error announcements, 44-pixel actions, 320px/400% reflow, forced colors,
reduced motion, long/CJK/RTL/bidi-safe names, permission-safe details, input
retention, and unknown-outcome recovery are release gates.

### D84-R26 — Zero public, Navigation, provider, donor, and money effect

D84 SHALL write no D1/D4 head, public path/breadcrumb, redirect, search/sitemap/
cache state, external provider/control-plane state, donor/missionary/public UI,
schedule, designation, currency, recurring, contribution, Stripe, or ledger
fact. A qualified same-database Payload persistence adapter is permitted; its
native reorder endpoint and provider authority are not.

### D84-R27 — Safe migration and mixed versions

Migration SHALL infer no explicit/default provenance from current order.
Unknown state uses D2 review. Readers land before writers; old/native writers
are fenced; shadow planning and limited cohorts precede expansion; compatible
readers remain through rollback.

### D84-R28 — Traceability and evidence

Glossary, ADR-0201-0205, Phase 12, proposed D2/D12 OpenSpec/design/tasks, living
spec, roadmap, tickets, migrations, tests, release evidence, and monitors SHALL
use the same terms, dispositions, owner boundaries, and current-unavailability
claim.

## Domain invariants

1. **I1:** D84 is one target Placement disposition inside D80-D84, not a
   second workflow.
2. **I2:** The target Page and Placement identity are fresh.
3. **I3:** Source Page and descendant identity/Placement inputs remain owned by
   their source tree.
4. **I4:** No immutable prior revision is mutated; only sealed owner-qualified
   D81/D82/D83 effects may advance an affected head/change source-clean or
   derived state; D84 adds no collateral pre-existing Page write and preserves
   the final cohort's relative order.
5. **I5:** Exactly one target Placement head exists after success.
6. **I6:** All participating facts, including the server-resolved Parent Page
   or Site-root placement owner, share exact trusted scope.
7. **I7:** Exactly one of a closed `reviewed_gap` shape (start, between, end, or
   only) or known `append_last` is commit-ready.
8. **I8:** Unknown provenance is never append-last.
9. **I9:** Rank/order state never proves explicit intent.
10. **I10:** A reviewed gap commits only while its tagged closed boundary and
    stable identities where applicable remain valid in the final baseline
    cohort.
11. **I11:** A stale explicit boundary never silently appends.
12. **I12:** Append-last inserts after the tail resolved from the same post-
    D81/D82/D83 final baseline inside its commit.
13. **I13:** The target receives a fresh D2 order representation.
14. **I14:** Current siblings have one deterministic strict semantic order.
15. **I15:** Boundary provenance has no ongoing placement authority, obeys the
    handoff retention/privacy lifecycle, and cannot block authorized purge.
16. **I16:** Later reorder creates a new D2 Placement action/revision; it does
    not rewrite D84 history.
17. **I17:** D80-D84 commits once or has no authoritative effect.
18. **I18:** Exact semantic replay returns the same target/result.
19. **I19:** Same key with different semantics is rejected.
20. **I20:** Public source state and D1 serving head remain unchanged.
21. **I21:** Navigation membership/order remain unchanged.
22. **I22:** No external-provider/public-delivery call occurs.
23. **I23:** No donor, schedule, designation, currency, recurring, contribution,
    or ledger fact changes.
24. **I24:** Authorized business evidence, not technical logs/UI cache/provider
    rows, proves what happened.

## Lifecycle and valid transitions

| State/event                                             | Required result                                                    |
| ------------------------------------------------------- | ------------------------------------------------------------------ |
| Positively proved reviewed gap; exact gap current       | Ready                                                              |
| Positively proved append-last default                   | Ready                                                              |
| Trusted Top-level choice resolves to current root       | Ready; display remains “at top level,” not “under Home”            |
| Missing/legacy/contradictory provenance                 | Review required; no mutation                                       |
| Explicit boundary deleted/Trashed/reparented            | Stale; no fallback                                                 |
| Sibling inserted into exact reviewed gap                | Stale; no fallback                                                 |
| Source clean restores source inside gap                 | Stale; no fallback                                                 |
| New first/last Page changes explicit start/end          | Stale; no fallback                                                 |
| New Page appears in explicit only/empty cohort          | Stale; no fallback                                                 |
| Tail changes for known append-last                      | Re-resolve final-baseline tail; no staff re-review                 |
| Unrelated sibling edit elsewhere                        | Gap remains eligible when exact semantics prove unchanged          |
| Boundary title/content changes only                     | Permission-safe label refresh; semantic gap remains eligible       |
| Parent/scope/locale/effect changes                      | Block/replan                                                       |
| Two commands use same gap                               | At most one uses original gap; other reviews current result        |
| Two append-last commands                                | Serialize/retry; each appends at its commit                        |
| Same semantic replay                                    | Return original receipt/position                                   |
| Same key, different parent-or-root/boundary/source/mode | Conflict; no mutation                                              |
| Transaction collision/serialization/deadlock            | Retry complete command under same semantics                        |
| Lost response after commit                              | Reconcile receipt; never repeat effect blindly                     |
| Cancel before commit                                    | No authoritative effect                                            |
| Commit success                                          | Target private, receipt durable, zero external/public effect       |
| Later ordinary reorder                                  | New D2 revision; historical D84 receipt unchanged                  |
| Feature rollback                                        | Stop new commands; retain committed target/readers; repair forward |

No row named `ready`, `stale`, or `committing` is required. These are observable
command/UI states over existing D2/D12 heads, plan evidence, and receipt.

## Logical data contract without premature schema freeze

| Fact                            | Authoritative owner                                         | Minimum semantics                                                                                            | Never authority                                       |
| ------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| Current target parent/order     | D2/D12 target Placement Revision/head                       | exact scope, visible Parent/Top-level choice, trusted resolved owner, strict sibling order, revision/version | browser/null root inference, provider row alone       |
| Explicit/default classification | Immutable causative D2 placement command receipt/provenance | source candidate, resolved owner, mode, closed boundary kind/IDs where applicable, actor/cause/version       | boolean intent flag, drag telemetry, audit text       |
| Prepared result                 | D80-D84 sealed plan                                         | request/heads/D81-D83 manifest/final-baseline/mode/boundary or append semantics/digests/expiry               | current authority or writable tree head               |
| Committed handoff               | Extended D80-D84 semantic receipt                           | target/revision, predecessor effects, mode, actual boundary/order result, actor/time/idempotency/retention   | Page content, Navigation, public head                 |
| Physical order token            | Qualified D2 persistence adapter                            | strict-sort representation and adapter version                                                               | staff intent, authorization, stable business identity |
| Page-tree/handoff UI            | Rebuildable projection                                      | permission-safe current labels/result/status                                                                 | write authority or adjacency source                   |
| Navigation order                | D4 Navigation Revision                                      | independent visitor-menu snapshot                                                                            | D2 sibling order                                      |
| Public release                  | D1 Public Site Generation                                   | exact selected Placement and artifacts                                                                       | D84 receipt/provider rank                             |

The accepted D2 design may choose the exact tables and rank grammar. It must
make invalid scope/head/order combinations impossible through structural
constraints or one authoritative mutation boundary and may not introduce a
current D84 tree/head beside D2.

## Final staff, Tenant, and donor experience

### Ready reviewed-gap state

Inside the existing Parent Page/Web address consequence group:

> **Page tree position**  
> **After:** Mission trips  
> **Before:** Resources  
> Uses the position reviewed in the saved Page change. Navigation and the live
> website will not change.

The description-list semantics and separate labels remain understandable in
RTL, with duplicate titles, and without arrows or visual indentation.

Explicit boundary states use closed shapes and visibly retain reviewed intent:

> **Page tree position**  
> **Result:** First under Serve  
> **Before:** Mission trips  
> Uses the position reviewed in the saved Page change. Navigation and the live
> website will not change.

> **Page tree position**  
> **Result:** Last under Serve  
> **After:** Resources  
> Uses the position reviewed in the saved Page change. Navigation and the live
> website will not change.

An explicit empty cohort says **Only Page under Serve** and **Uses the only
position reviewed in the saved Page change**. This keeps an explicit `only`
boundary distinct from the default even though their immediate result matches.

### Ready known-default state

> **Page tree position**  
> **Result:** Last under Serve  
> No sibling position was chosen in the saved Page change. The new Page will be
> added at the end when this handoff finishes. Navigation and the live website
> will not change.

For an empty cohort under a Parent Page:

> **Page tree position**  
> **Result:** Only Page under Serve  
> No sibling position was chosen in the saved Page change. The new Page will be
> the only Page under Serve when this handoff finishes. Navigation and the live
> website will not change.

When D80 selected **Top level**, D2 still resolves the trusted root placement
owner internally, but the same visible states read **First at top level**,
**Last at top level**, or **Only Page at top level**. Staff never see a
misleading “under Home” label and no nullable parent chooses that state.

### Stale and unknown states

> **Page order changed**  
> The saved position is no longer available. Review the updated position.
> Nothing was moved or published.  
> **Review position**

Unknown is not mislabeled stale:

> **Review the Page tree position before continuing**  
> We couldn't verify whether this Page's position was deliberately chosen. Your
> saved work is safe.  
> **Review position**

`Review position` uses the existing D2 owner control. It is not a D84 modal or
picker. Permission errors use capability-neutral copy and never invent a role:

When aggregate structural placement is allowed but anchor/specific-cause detail
is not, use the same status shape and timing with cause-neutral copy:

> **Position needs review**  
> Review the current Page tree position. Nothing was moved or published. Your
> saved work is safe.  
> **Review position**

> You don't have access to complete this Page-tree review. Ask someone with
> permission to manage this Site's Page tree. Nothing was moved.

### Success and unknown outcome

> **Saved changes moved**  
> Short-term team application was created after Mission trips and before
> Resources. Navigation and the live website did not change.

Unknown transport result:

> **We could not confirm whether the handoff finished**  
> Check the result before trying again. Your saved work is safe.

The current actor is reauthorized before any target detail/link is rendered.
There is no donor/visitor UI; the best public experience is proven non-change.

## Acceptance criteria and proof matrix

### Functional and boundary outcomes

1. **AC1:** A valid middle reviewed gap creates the fresh target between the
   exact predecessor and successor in the final baseline cohort for both an
   eligible Parent Page and D2-resolved Top level.
2. **AC2:** Tagged explicit start, end, and only boundaries create First, Last,
   and Only results without ambiguous null meaning in both Page-parent and Top-
   level cohorts; adding a new first/last/only-cohort member before commit
   stales that explicit boundary.
3. **AC3:** Known append-last under an empty Page-parent or Top-level cohort
   creates the only Page and uses the correct “under” or “at top level” copy.
4. **AC4:** Known append-last under a non-empty Page-parent or Top-level cohort
   inserts after the tail of the locked post-D81/D82/D83 baseline. Tests cover
   source cleanup entering/leaving the tail and changing empty/non-empty state;
   unrelated concurrent tail churn re-resolves rather than staling the default.
5. **AC5:** A rank/current adjacency without qualified D2 provenance cannot
   enter reviewed-gap.
6. **AC6:** Positively known default provenance enters append-last.
7. **AC7:** Missing/legacy/unreadable/contradictory provenance blocks with the
   ordinary D2 review and never appends.
8. **AC8:** The target gets fresh Page, Placement revision/head, and order
   representation identities.
9. **AC9:** No immutable prior revision is mutated. Only exact sealed D81/D82/
   D83 owner-qualified effects may advance affected heads/change source-clean
   or derived state; D84 causes no additional pre-existing Page write.
10. **AC10:** Pages outside the predecessor-effect manifest retain parent/order,
    and all pre-existing members of the resulting final cohort preserve exact
    relative order around the new target.
11. **AC11:** Reviewed boundary IDs remain minimized receipt provenance, do not
    move the target after later work, obey `material_page_handoff` retention/
    privacy/legal-hold/deletion/anonymization/export/backup/tombstone outcomes,
    and never block authorized target/anchor purge through a permanent FK.
12. **AC12:** Later ordinary reorder creates a new D2 Placement successor and
    leaves D84 receipt/history unchanged.
13. **AC13:** D84 changes no Navigation Revision or membership.
14. **AC14:** D84 writes no D1 serving head or public path/breadcrumb.

### Negative, edge, privacy, and authorization outcomes

15. **AC15:** Deleted/Trashed predecessor or successor blocks reviewed-gap.
16. **AC16:** Reparented/cross-parent boundary blocks; caller/null/cross-Site
    attempts to fabricate Top level fail, while the trusted current root mapping
    is used without displaying “under Home.”
17. **AC17:** Swapped/non-adjacent boundaries block.
18. **AC18:** A new sibling inserted into the reviewed gap stales it; there is
    no append fallback.
19. **AC19:** Source clean restoring the source inside the reviewed gap stales
    it and requires review.
20. **AC20:** Unrelated sibling change outside the gap does not stale an intact
    semantic gap.
21. **AC21:** Boundary title/content edits refresh authorized labels without
    changing semantic eligibility.
22. **AC22:** Parent/root mapping, source/target head, locale, scope, family,
    lifecycle, D82, or D83 drift blocks/replans before mutation.
23. **AC23:** Permission revocation before commit blocks; no prior visibility or
    provider access grants authority.
24. **AC24:** Cross-Tenant, environment, Site, locale, parent/root owner, Page,
    anchor, plan, and receipt substitution fail structurally and through policy.
25. **AC25:** Old-row `USING` plus resulting-row `WITH CHECK` prevent an allowed
    row/effect from becoming forbidden.
26. **AC26:** Payload Local API, service role, RPC, job, import, migration,
    support, repair, and AI paths cannot bypass the same effect proof.
27. **AC27:** The target-parent structural effect evaluates the complete cohort
    without granting content reads. Restricted neighbor titles, paths, counts,
    locales, owners, existence, and specific stale cause do not leak through
    UI, logs, errors, status shape, timing, receipt, audit, export, or backup;
    hidden-anchor/interposed-sibling fixtures receive authorized aggregate or
    fully redacted cause-neutral outcomes.
28. **AC28:** Duplicate titles use only authorized disambiguation and remain
    understandable in long/CJK/RTL cases.

### Concurrency, failure, database, and migration outcomes

29. **AC29:** Two same-gap commands cannot both use the original gap; a
    concurrent new first/last/only-cohort Page stales the corresponding explicit
    boundary; each loser receives review-required without partial effect.
30. **AC30:** Concurrent appenders serialize/retry into one strict order with
    exactly one target/receipt per semantic command.
31. **AC31:** Duplicate provider/order key collides and retries or fails safely;
    Page ID is never a silent tie-break.
32. **AC32:** Serialization/deadlock retry repeats the complete semantic command
    including order choice.
33. **AC33:** Exact semantic replay returns original target, order, and receipt
    after later siblings exist.
34. **AC34:** Same key with changed source/parent-or-root/mode/closed-boundary/
    heads conflicts.
35. **AC35:** Lost response after commit reconciles the original receipt and
    does not create another target or repeat cleanup.
36. **AC36:** Every failpoint before commit leaves zero authoritative D80-D84
    effect; every after-commit failure retains one complete receipt/result.
37. **AC37:** D84 performs no unbounded sibling scan, synchronous full-set
    rebalance, or collateral pre-existing Page parent/order update outside the
    sealed D81/D82/D83 manifest at active D33 cases.
38. **AC38:** Equality-leading scope/resolved-parent/order indexes serve
    boundary/tail, head, authorization, receipt, and RLS query shapes under
    production plans for both Page-parent and Top-level cohorts.
39. **AC39:** Existing provider ranks are never backfilled as explicit/default
    provenance; unknown rows quarantine or use D2 review.
40. **AC40:** Old-code/new-data and new-code/old-data matrices fail safely;
    at least one qualified reader remains for committed D84 results through
    rollback.
41. **AC41:** A frozen install reproduces the recorded lock integrity and exact
    installed orderable hashes; that pinned Payload artifact passes order,
    access, transaction, hook, native-endpoint fence, and upgrade contract
    tests. Any dependency drift regenerates evidence before qualification.
42. **AC42:** Disabling D84 stops new commands without deleting/reversing a
    committed target or source checkpoint.

### UX, accessibility, traceability, and zero-effect outcomes

43. **AC43:** Between, explicit First/Last/Only, default Last/Only, Page-parent/
    Top-level, detailed stale, cause-neutral review, unknown, checking,
    committing, success, and unknown-outcome states use the exact plain-language
    meaning above and visibly distinguish reviewed intent from default.
44. **AC44:** The position row is always visible in ready review; staff need no
    modal/disclosure to learn the outcome.
45. **AC45:** The handoff keeps one primary CTA and no required picker,
    RadioGroup, checkbox, drag, wizard, or second confirmation.
46. **AC46:** Any ordinary tree drag has a named single-pointer and keyboard/AT
    equivalent that achieves the same move.
47. **AC47:** Keyboard/focus tests prove logical order, no background focus
    theft, one linked error-summary focus, useful restoration after deliberate
    position action, and complete status announcements.
48. **AC48:** 320-CSS-pixel/400% zoom, forced colors, reduced motion, touch,
    long text, CJK, RTL, bidi, duplicate-title, and screen-reader tests retain
    all information/function without directional arrows carrying meaning.
49. **AC49:** Weak/offline/reconnect/reauthentication tests retain safe entered
    values and never call optimistic state committed.
50. **AC50:** Public route/body/status/canonical/breadcrumb/Navigation/search/
    sitemap/cache and donor-visible snapshots are byte/semantically identical.
51. **AC51:** Spies prove zero Vercel, DNS, TLS, search/cache, Stripe, Resend,
    ledger, CRM, email, or external-integration call from D84.
52. **AC52:** Trace links preserve one terminology/number set from founder
    answer through glossary, ADR, OpenSpec, design/tasks, tickets,
    implementation, tests, monitors, and release evidence; current runtime is
    never reported available before proof.
53. **AC53:** A predeclared representative moderated ministry-staff protocol
    meets the non-null launch Operational Qualification acceptance threshold
    for correctly identifying the target's final private Page-tree position,
    D84's no-collateral-write boundary versus disclosed source-clean effects,
    Navigation/live-site non-effect, whether review is required, and the one
    next action. The protocol records sample, tasks,
    scoring, assistive/mobile/translated coverage, and remediation; a failed
    threshold revises the flow/copy and repeats before cohort expansion.

## Production monitors

| Signal                                        | Threshold                                                                                                                                                                                                                                          | Owner                          | Required response                                                                                                         |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `D84_UNKNOWN_POSITION_FALLBACK_TOTAL`         | Any unknown/missing provenance committed as reviewed-gap or append-last                                                                                                                                                                            | Web Studio + D2 owner          | Disable D84; preserve candidates; correct eligibility; require D2 review for affected cohort.                             |
| `D84_POSITION_OR_COLLATERAL_MISMATCH_TOTAL`   | Any target outside the validated final-baseline outcome, duplicate strict-order result, or D84-caused pre-existing Page parent/order mutation outside the sealed D81/D82/D83 manifest                                                              | Data Integrity owner           | Kill switch; quarantine target from D1; preserve evidence; repair through forward D2 revisions; requalify adapter.        |
| `D84_CROSS_SCOPE_OR_UNAUTHORIZED_ALLOW_TOTAL` | Any occurrence                                                                                                                                                                                                                                     | Security owner                 | P0 incident response; disable command; assess disclosure; repair grants/RLS/privileged paths; rerun hostile matrix.       |
| `D84_IDEMPOTENCY_DIVERGENCE_TOTAL`            | Any semantic command with more than one target/result or replayed different placement                                                                                                                                                              | Material-purpose handoff owner | Stop command/retries; reconcile receipts; fence affected scope; repair forward.                                           |
| `D84_PUBLIC_OR_EXTERNAL_EFFECT_TOTAL`         | Any D1/D4/public/Vercel/DNS/TLS/Stripe/Resend/money or other external provider/control-plane effect or call; qualified same-database Payload persistence is excluded                                                                               | Web Platform on-call           | Kill switch; restore authoritative public state if needed; investigate boundary breach; requalify before restore.         |
| `D84_UNAUTHORIZED_DETAIL_TOTAL`               | Any unauthorized sibling/title/path/count/owner/Site/locale/specific-cause disclosure or boundary evidence retained/exported/restored beyond the current `material_page_handoff` policy                                                            | Security + Web Studio          | Disable affected detail; invoke incident response; correct policy/cache/retention; rerun non-enumeration/lifecycle tests. |
| `D84_COMMIT_PROFILE_BREACH`                   | Any active D33 hard limit or evidence-qualified alert ceiling breached                                                                                                                                                                             | Database/SRE                   | Halt cohort; inspect indexes/locks/key allocation; lower admitted profile or fix D2; never weaken invariants.             |
| `D84_STALE_REVIEW_BURDEN`                     | The non-null launch Operational Qualification ceiling is breached; attachment defines numerator (eligible reviewed-gap submissions rejected solely for gap freshness), denominator (eligible reviewed-gap submissions), window, and minimum sample | Web Studio Product + Platform  | Narrow dependency scope or improve refresh/review UX; do not weaken adjacency/CAS.                                        |

## Migration and release order

1. Record ADR-0205, glossary, D80-D83/Phase 12/living-spec/roadmap/decision-log
   reconciliation in this documentation workspace.
2. Amend proposed ADR-0146 D2/D12 OpenSpec/design/tasks at their reviewed PR
   head with D84-R1-R28 and AC1-AC53 before ticket publication.
3. Implement/qualify D1/D2/D4/D12/D33/D79-D83 first; D84 cannot precede its
   owners.
4. Expand compatible D2 provenance/readers and exact same-scope constraints/
   indexes with all D84 writers disabled.
5. Census current/imported/migrated order. Do not infer intent/default; route
   unknown rows through ordinary D2 review.
6. Shadow-plan reviewed-gap/append results, final-topology simulation, and
   permission-safe projections against production-shaped fixtures.
7. Fence legacy/native/provider order writers/endpoints and qualify the exact
   Payload/PostgreSQL adapter, transaction, access, and failure behavior.
8. Run D33 min/typical/measured-max, concurrency, failpoint, migration,
   authorization, privacy, accessibility, internationalization, weak-network,
   and zero-effect evidence.
9. Enable a limited observable cohort with the eight monitors and one kill
   switch; expand only after proof.
10. Retain compatible readers for every committed result. Rollback disables new
    commands and repairs forward; it never rewrites History.

## Documentation reconciliation and traceability status

| Artifact                       | Recorded/current requirement                                                                                                  |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Glossary                       | Add Reviewed Sibling Placement, trusted Top-level resolution, closed boundaries, and provider/Navigation distinction.         |
| ADR-0201                       | Target creation consumes D84 semantic placement; source/provider rank never transfers and predecessor effects remain owned.   |
| ADR-0202                       | Sealed plan/transaction/receipt include final baseline, D84 mode/provenance/result, and no D84 collateral write.              |
| ADR-0203/0204                  | D82/D83 remain route/derived-closure owners; D84 changes only fresh target order.                                             |
| D80-D83 reviews                | Replace D84 placeholder with the settled qualified contract and close the handoff branch.                                     |
| Phase 12                       | No new capability; structural calculation and consequence-detail visibility remain separate existing effects.                 |
| Living spec/roadmap            | Extend D80-D84 with trusted root mapping, final baseline, predecessor manifest, current unavailability, and adapter boundary. |
| Proposed OpenSpec PR #1340     | Add D2/D12 general provenance and D84 scenarios before implementation; do not silently edit blocked proposal from `develop`.  |
| Tickets/tests/release evidence | Carry R1-R28, I1-I24, AC1-AC53, eight monitors, D33 proof, and exact current-unavailability language.                         |

## Final disposition

**Accept with required amendments.**

The founder's intended UX is correct. The required permanent interpretation is
positive D2 provenance plus closed-boundary validation against the final
baseline, or positive append-default provenance plus tail resolution against
that same baseline. Trusted Top-level resolution, manifest-bounded predecessor
effects, structural/detail authorization separation, and boundary-evidence
retention are required—not optional implementation notes. Unknown provenance
and stale explicit positions require ordinary D2 review. Without the accepted
general D2 provenance contract, D84's explicit-preservation branch is
unavailable.

## Exact corrected decision to record

> **D84 — Reviewed sibling placement with append-last default.** The D80-D84
> handoff shall create the fresh private target using D2's general new-Page
> placement command. The visible choice is an eligible Parent Page or **Top
> level**; D2 resolves Top level from trusted Site context to the existing Site-
> root placement owner/root Page, never from null or caller input.
>
> A reviewed position may be preserved only when the exact current acknowledged
> source Placement candidate is linked to immutable D2 command provenance that
> positively proves staff selected one tagged closed boundary:
> `start(successor)`, `between(predecessor, successor)`, `end(predecessor)`, or
> `only(empty cohort)`. Stable Page identities are required where applicable;
> null means none of these things. Under lock, D2 shall determine the exact
> qualified D81/D82/D83 effect manifest, derive its post-clean/pre-target final
> sibling cohort, validate the explicit boundary against that cohort, and
> generate a fresh target order value in the one transaction. It shall infer
> nothing from a rank, array index, provider row, import, migration, or UI state.
>
> Append-last is available only when D2 provenance positively records the
> ordinary default or no explicit sibling position. D2 resolves the tail from
> that same final baseline at commit. Missing, legacy, unreadable,
> contradictory, corrupt, or unrecognized provenance requires ordinary D2
> review. A stale explicit boundary also requires review and never silently
> appends. Unrelated changes that preserve the exact closed-boundary semantics
> need not force re-review.
>
> The target receives one fresh Placement revision/head/order representation.
> No immutable prior revision is mutated. Only sealed owner-qualified D81/D82/
> D83 effects may advance affected heads or change source-clean/derived state;
> D84 causes no additional pre-existing Page write and preserves the relative
> order of the final cohort while inserting only the target. Boundary identities
> are minimized, tombstonable `material_page_handoff` evidence with no
> continuing placement authority or purge-blocking FK. Exact replay returns the
> original result.
>
> D84 adds no capability, order engine, mandatory selector, Navigation/public
> route/generation change, external provider/control-plane call or effect,
> Vercel call, donor UI, schedule, designation, currency, recurring,
> contribution, Stripe, or ledger effect. The qualified same-database Payload
> persistence adapter may participate; Payload's native reorder endpoint is not
> authority.

## Phase 24 coverage disposition

D84 closes the remaining target-Placement facet of the D80-D84 material-purpose
handoff. A fresh dependency scan found no justified D85 inside that branch:
folder, Topic, Navigation, schedule, publication, domain, content owner, and
money facts are already explicitly non-transferable and remain ordinary owner
actions. Asking separate handoff questions for each would create hidden coupling
and over-grooming.

The next correct action is a complete Phase 24 decision-to-spec coverage audit
and consolidated OpenSpec/PRD synthesis. The former D56 access-profile
withdrawal-authority question remains explicitly deferred to its Phase 12/17
activation boundary and is not silently treated as a Phase 24 completion fact.
A new founder question should be asked only if that coverage audit proves a
real unresolved Phase 24 product choice.

## References

- [ADR-0205 - Reviewed sibling placement with append-last default](../../adr/0205-reviewed-sibling-placement-with-append-last-default.md)
- [ADR-0204 - Atomic source-tree draft-path re-derivation](../../adr/0204-atomic-source-tree-draft-path-rederivation.md)
- [ADR-0203 - Atomic adoption of exact draft-only Page path claims](../../adr/0203-atomic-adoption-of-exact-draft-only-page-path-claims.md)
- [ADR-0202 - Atomic material-purpose Page handoff](../../adr/0202-atomic-material-page-handoffs-append-clean-source-revisions.md)
- [ADR-0201 - Material-purpose changes create independent Pages](../../adr/0201-material-purpose-changes-create-independent-pages.md)
- [Proposed ADR-0146 - Staged hierarchical public paths](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0146-staged-hierarchical-public-paths-under-coherent-site-generations.md)
- [Proposed Web Studio D2 OpenSpec](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/openspec/changes/add-web-studio-cms/specs/web-studio-cms/spec.md)
- [Payload collection ordering](https://payloadcms.com/docs/configuration/collections)
- [Payload Local API access control](https://payloadcms.com/docs/local-api/access-control)
- [Payload transactions](https://payloadcms.com/docs/database/transactions)
- [Craft 5 structured-entry placement](https://craftcms.com/docs/5.x/reference/element-types/entries.html#structures)
- [Umbraco Page sorting](https://docs.umbraco.com/umbraco-cms/tutorials/editors-manual/getting-started-with-umbraco/ordering-pages)
- [WordPress Page hierarchy and order](https://wordpress.org/documentation/article/create-pages/)
- [Shopify collection reorder mutation](https://shopify.dev/docs/api/admin-graphql/latest/mutations/collectionReorderProducts)
- [Figma ordered sequences](https://www.figma.com/blog/realtime-editing-of-ordered-sequences/)
- [Figma multiplayer hierarchy](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html)
- [PostgreSQL serialization retry](https://www.postgresql.org/docs/current/mvcc-serialization-failure-handling.html)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [WCAG 2.2 Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)
- [WCAG 2.2 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)
- [WCAG 2.2 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [WCAG 2.2 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [WAI rearrangeable listbox example and production warning](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/examples/listbox-rearrangeable/)
- [Atlassian drag accessibility guidance](https://atlassian.design/components/pragmatic-drag-and-drop/accessibility-guidelines)
