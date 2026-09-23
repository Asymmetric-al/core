# Phase 24 D83 — Atomic Source-tree Draft-path Re-derivation adversarial review

**Date:** 2026-08-31  
**Founder answer reviewed:** Option 1 — re-derive source descendants in place
through D2, subject to proof that this is current best practice and provides
excellent Core-consistent staff UX without brittleness or unnecessary
machinery.  
**Final disposition:** **Accept with required amendments**  
**Canonical decision:**
[ADR-0204](../../adr/0204-atomic-source-tree-draft-path-rederivation.md)

## Outcome first

The product judgment survives. Automatic recomputation is the right result
when a private descendant address is purely derived from an ancestor that Core
is already cleaning. Requiring staff to perform a second Page-tree operation or
confirm every unchanged child would add work without adding meaning.

The phrase **re-derive in place** does not survive literally. It could invite a
recursive Payload hook to mutate or revalidate every child document, append
meaningless history, hold an unbounded transaction open, or return misleading
success after a descendant failure. The permanent decision is therefore
**Atomic Source-tree Draft-path Re-derivation**:

> When a qualified D80-D82 material-purpose handoff cleans the source
> ancestor's private Placement and thereby changes derived private addresses
> and their corresponding breadcrumbs for same-scope Site-locale descendants that remain
> source-owned, D2 SHALL server-compute and seal the complete affected closure.
> D2 SHALL preserve every descendant's stable Page identity, direct parent,
> authored local segment, sibling order, Editorial content, Placement History,
> Navigation, permissions, schedules, references, public state, and owner
> authority. It SHALL recompute only D2-owned derived private paths,
> breadcrumbs, route deltas, and current draft-claim outcomes.
>
> Preparation MAY be bounded and resumable through D2's accepted sealed plan/
> impact artifact. That artifact is not a current private closure head. The one
> D80-D84 commit SHALL atomically apply the
> exact qualified successor closure, perform D82's root claim succession,
> create the private target, clean the source, and append one receipt/audit/
> outbox result—or do none. Equality with the same stable descendant's exact
> current public route is proved **public-pin convergence**: D2 supersedes the
> old private effect and returns to the public Placement result without a
> duplicate private claimant or redundant revision; one clean successor is
> allowed only when D83-R5's accepted representation requires it. A changed old-to-new draft
> address still appears once in the closure, receipt, and staff count. Every
> other collision, protected/unknown route,
> stale or inaccessible member, independent incompatible Placement effect,
> or over-capacity closure blocks before mutation and uses ordinary D2 cleanup
> first.
>
> D83 SHALL recursively resave no child Payload document, transfer no subtree,
> rewrite no literal link, add no D83-specific workflow/capability/table/route engine, and
> change no public generation, Navigation, redirect, Vercel, cache/search,
> donor, Stripe, or money truth.

This is the current best permanent path because it combines four modern,
proven ideas without importing a vendor's weaknesses: normalized direct parent
inputs, derived descendant paths, immutable/optimistically fenced versions,
and one D33-admitted atomic business transition. It remains unavailable in current
`develop` until the accepted D1/D2/D12/D80-D82 substrate and proof gates exist.

## Ruthless synthesis — what actually must happen

### Required amendments applied before recording

1. Replace **in-place rewrite** language with **Atomic Source-tree Draft-path
   Re-derivation** and define **in place** only as stable Page identity and
   source-tree membership.
2. Make D2—not Payload, the browser, a projection, or the handoff UI—the sole
   closure and path owner.
3. Preserve authored descendant Placement inputs and every existing immutable
   History row; append a cause-labelled successor only if D2's accepted
   physical representation requires one.
4. Give every old derived claim exactly one successor, same-Page public-pin
   convergence, unchanged-current-private-effect result, or pre-mutation
   blocker, while counting every real old-to-new address change once.
5. Reuse D2's bounded/resumable preparation and one D33-admitted atomic
   business transition; never invent a private closure head or recursively
   resave an unbounded tree.
6. Keep ordinary D2 cleanup first as the permanent fallback when proof,
   authorization, or the active D33 capacity bound cannot pass.

### Requirements that belong in the spec/design

- exact same-Tenant/environment/Site/locale server-derived closure and phantom-
  safe structural fence;
- complete old/new canonical-key, breadcrumb, claim, head, lease/dependency,
  schedule, permission, policy, and public-pin proof;
- one sealed, digest-bound D2 plan/impact artifact and one extended D80-D84 semantic receipt,
  not embedded thousands of paths or a second route ledger;
- same-scope composite relationships, restrictive deletes, authoritative
  current-head/claim constraints, equality-leading indexes, and D2-owned cycle/
  depth/normalization enforcement;
- least grants, `USING` plus `WITH CHECK`, required `SELECT`, append-only
  history denial, and identical privileged/service/Payload/RPC behavior;
- one PageShell consequence review with visible affected count, proportional
  exact detail, one existing primary action, persistent recovery, and no donor
  UI; and
- mixed-version fences, rollout census, old-writer removal, failpoint proof,
  and named production monitors.

### Implementation safeguards, not new product choices

- stable-ID deterministic lock order and full-command retry after deadlock or
  serialization failure;
- no remote I/O, user wait, `SKIP LOCKED` membership/commit behavior, child-by-
  child HTTP loop, or unawaited hook inside the authoritative transaction;
- unrelated Editorial drafts/leases remain untouched; only relevant Placement
  dependencies are fenced;
- old preview credentials never retarget; literal path strings never
  auto-rewrite; and
- over-capacity or owner-conflicted closures fail closed to ordinary D2 rather
  than creating a saga.

### Risks that may be monitored only after proof

Only measured frequency, latency, and stale-review friction may remain monitor
items. Partial/cross-scope effects, public-delivery/external-provider effects, receipt mismatch,
or unauthorized disclosure are invariant breaches with an **any occurrence**
threshold and immediate kill-switch response; they are not accepted residual
risk.

## Fact classification

| Classification                         | Finding                                                                                                                                                                                                                                                      |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Verified current repository fact       | `develop` has no D2/D12/D80-D84 implementation substrate; it has a Tenant-only Payload Page, scalar slug, provider drafts, and a newest-published-row reader.                                                                                                |
| Verified proposed repository fact      | PR #1340's ADR-0146/OpenSpec D2 requires complete descendant closure, exact old/new paths, bounded searchable/resumable high-fan-out preparation, unchanged descendants without separate approval, and one coherent D1 activation.                           |
| Verified primary-source fact           | Payload Nested Docs cascades derived breadcrumb/URL changes through descendants; Payload transactions require participating operations to share and await the request transaction.                                                                           |
| Verified primary-source fact           | Sanity's current Hierarchy **Public Beta** corroborates direct-parent/cycle/depth patterns; its stable transaction docs supply atomic mutation and revision guards. It is not a Core dependency or production-proof substitute.                              |
| Verified primary-source fact           | PostgreSQL recursive queries support tree traversal; constraints, deterministic lock order, and full-transaction retry are the appropriate final safety mechanisms.                                                                                          |
| Verified accessibility fact            | WCAG 2.2 discourages redundant re-entry, requires reflow at 320 CSS pixels/400 percent, textual error identification, and programmatically determinable status messages.                                                                                     |
| Reasonable inference                   | Automatically recomputing only compiler-owned private derived outputs is less error-prone and lower-friction than asking staff to restate a deterministic result.                                                                                            |
| Product judgment                       | The existing handoff action is sufficient closure-level confirmation when count and consequence are visible; exact mappings can remain proportional detail.                                                                                                  |
| Assumption requiring evidence          | Ministry incidence, typical closure size, and comprehension of the proposed copy are unknown; production-shaped usability and capacity evidence must verify them.                                                                                            |
| Intentionally unresolved design choice | D2 may use a sealed digest-bound plan/impact artifact to drive a bounded set-based succession or another qualified representation. D83 fixes observable invariants and forbids a second private authority head; it does not freeze an unproved table layout. |

## Current behavior, intended behavior, and permanent path

| Layer               | Current `develop`                                                                           | Proposed/accepted intent                                             | Permanent D83 path                                             |
| ------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------- |
| Page scope          | `pages.ts` has one Tenant relationship and scalar slug                                      | Stable Page plus exact Site/locale Editorial and Placement revisions | No D83 until that identity exists; same-scope closure only     |
| Storage constraints | `tenant_id`/`slug` nullable; Tenant FK `ON DELETE SET NULL`; ordinary non-unique slug index | D2 same-scope hierarchy/claim constraints                            | Composite scope, restrictive lifecycle, one current head/claim |
| Hierarchy           | No accepted parent/sibling/closure owner                                                    | ADR-0146 D2 direct parent/local segment/order and derived paths      | Reuse D2 closure compiler; no provider tree authority          |
| Working safety      | Provider draft/version defaults                                                             | D12 expected revision, lease generation, immutable checkpoints       | Fence only affected Placement dependencies; no merge/overwrite |
| Public read         | Newest matching published Payload row by Tenant/key                                         | D1 immutable Public Site Generation and serving-head CAS             | Public generation remains bit/logically unchanged              |
| Provider behavior   | Payload can recursively resave nested descendants                                           | Provider helper only after exact qualification                       | Do not use recursive child resave as D83 command               |
| Staff UX            | No D80-D84 product                                                                          | One PageShell Publish/handoff consequence review                     | Visible count, proportional mappings, one existing action      |

Specific current-runtime evidence:

- `apps/admin/src/cms/collections/pages.ts:42-91` has no Site, locale, parent,
  sibling, Placement, closure, route claim, or D12 lease/head model.
- `apps/admin/src/migrations/20260515_173042_init_payload_cms.ts:143-156`
  leaves critical Page scope/slug fields nullable; line 1147 uses
  `ON DELETE SET NULL`; line 1305 creates only `pages_slug_idx`.
- `apps/admin/src/cms/public/published-content-reader.ts:223-227` selects the
  newest matching published document rather than an activated D1 generation.
- `apps/admin/src/lib/tenant/resolve-tenant.ts:18-29` still resolves no Site.
- At the review snapshot, local `HEAD` and fetched `origin/develop` were both
  `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. Proposed Phase 23 PR #1340 was
  `OPEN/BLOCKED` at `9069dcad67f9630323474ca5ee8bcc85ca7bf0f6`; proposed
  Phase 22 PR #1323 was `OPEN/BLOCKED` at
  `70c50e8c97556c43be5543332fb0993b468b90ab`.

## Primary research and strongest alternative

### What the evidence supports

- Payload's current Nested Docs documentation explicitly derives breadcrumb
  URLs from ancestors and recursively updates descendants. That establishes
  cascading derived-state recomputation as ordinary CMS behavior.
- Payload's transaction documentation requires nested operations to share the
  request transaction and warns that unawaited transactional hooks can return
  an incorrect success. An open 2026 Payload issue reports exactly that kind
  of misleading success when a recursive child validation rolls back a parent
  update. The issue is evidence of a current reported failure mode, not proof
  that every Payload build is affected.
- Sanity's current Hierarchy **Public Beta** corroborates normalized direct-
  parent and server cycle/depth patterns; its transaction docs support atomic
  mutation and revision-fenced stale-write rejection. The beta is not treated
  as a proven production dependency.
- PostgreSQL documents recursive tree queries, self-referential FKs, unique
  constraints, deadlock-safe lock ordering, and whole-transaction retry.
- WCAG Redundant Entry supports not asking staff to re-enter already-supplied
  parent/path values; it does not decide whether an impact list needs separate
  confirmation. Core's one-confirmation judgment follows D2's deterministic
  unchanged-descendant semantics and must pass the usability proof. WCAG
  status/reflow/error guidance governs accessible presentation and recovery.

No reviewed CMS supplies Core's full tenant-safe route history, D1 generation,
D2 claim exclusivity, D12 immutable Working contract, or D80-D84 handoff as an
off-the-shelf feature. Core must compose and prove these primitives rather than
label a provider default “best practice.”

### Strongest plausible alternative: ordinary D2 cleanup first

Option 2 is structurally excellent: keep D80-D82 singleton-only, send staff to
the existing Move Page impact review, resolve the source tree, then return to
the handoff when still applicable. It has the smallest new atomic surface and
remains D83's safe fallback. If resolution cleans/releases the source root
claim, however, D82 eligibility ends; the target path is merely an unreserved
ordinary suggestion and may lose a fresh race.

It is not the best default once D2 can prove the same closure in the same
transaction. It creates another navigation/review round trip, weakens mobile
and low-bandwidth completion, and asks staff to approve a result whose meaning
is already determined: every child stays with the source and only its private
derived address returns through the clean ancestor. Option 1 wins only inside
the exact mechanical and bounded cohort defined here; outside it, Option 2
wins automatically.

## Category-by-category adversarial review

Each concern below states the failure, importance, severity, likelihood,
evidence, effect on the founder answer, permanent prevention, and exact
language added by this review.

### 1. Problem validity, necessity, and alternatives

**Material concern exists: Yes.** The root problem is real only for a qualified
derived-only closure; a generic subtree-edit feature would solve the wrong
problem.

| Concern                                                            | What could go wrong and why it matters                                                                                                           | Severity / likelihood / evidence                                                                                                                             | Effect, permanent fix, and exact language                                                                                                                                                                                                     |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D83 becomes a general child-edit or subtree-transfer feature       | Staff could unknowingly move children or Core could create a second Page-tree workflow. That changes meaning rather than cleaning derived state. | **Critical / Medium.** D2 owns direct hierarchy; D80 creates one independent target and explicitly excludes owner transfer.                                  | **Narrows, does not invalidate.** Define D83 only for exact source-owned descendants whose direct Placement inputs remain compatible. **Add D83-R1/R2:** target inherits no descendant or owner fact; only D2-derived private outputs change. |
| A deterministic consequence receives a separate mandatory workflow | Staff would leave the handoff and repeat information, reducing completion with no added decision quality.                                        | **Medium / High.** D2 says unchanged descendants require no separate approval; the handoff action can be the one closure confirmation.                       | **Supports Option 1 subject to AC51 usability proof.** Keep one action and visible consequence count. **Add D83-R23/R24:** one existing closure-level confirmation; the exact D2 owner fallback applies when proof cannot pass.               |
| Exact physical schema is frozen before D2 design                   | A premature one-row-per-child or private-head choice could conflict with ADR-0146's per-resource Working model and sole public D1 head.          | **High / Medium.** Proposed D2 requires bounded/resumable preparation and one coherent public activation but does not define a current private closure head. | **Amends wording.** Specify observable plan/member/head/claim invariants; let accepted D2 design qualify a bounded set-based or equivalent adapter without a second authority. **Add D83-R11/R12/R29.**                                       |

### 2. Brittleness

**Material concern exists: Yes.** Naive recursion depends on a static tree,
perfect descendants, and one provider call succeeding everywhere.

| Concern                                                | What could go wrong and why it matters                                                                          | Severity / likelihood / evidence                                                                                                              | Effect, permanent fix, and exact language                                                                                                                                         |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Closure changes after preflight                        | A concurrently inserted or reparented child could be omitted, leaving an orphan old claim or inconsistent tree. | **Critical / Medium.** Row locks on discovered children do not prevent an undiscovered phantom without a structural fence.                    | **Narrows Option 1.** Server-compute closure and bind a hierarchy generation or equivalent phantom-safe authority. **Add D83-R3/R4/R12:** any membership drift aborts everything. |
| Provider recursion revalidates unrelated child content | One dangling child field could prevent a path-only cleanup or yield false success.                              | **High / Medium.** Payload Nested Docs cascades resaves; open issue #17457 reports swallowed child validation and rolled-back parent success. | **Changes implementation.** Never recursively resave child documents; preserve Editorial state and use D2 closure/claim operations. **Add D83-R5/R9/R13.**                        |
| Path is used as lock identity                          | Keys change during the operation, so lock order can differ and deadlock or target the wrong row.                | **High / Medium.** PostgreSQL warns that inconsistent multi-object lock order causes deadlocks.                                               | **Adds safeguard.** Lock stable scoped IDs in one order; retry whole command. **Add D83-R12/R20.**                                                                                |

### 3. Technical debt

**Material concern exists: Yes.** D83 can easily duplicate D2/D12 with a second
closure service, route table, receipt, or UI.

| Concern                            | What could go wrong and why it matters                                                                                             | Severity / likelihood / evidence                                                                                | Effect, permanent fix, and exact language                                                                                                                                                  |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Parallel hierarchy/route owner     | D2 and D83 could disagree about membership, normalization, or current claimant; every later change would require dual maintenance. | **Critical / Medium.** ADR-0146 already names D2 as the path compiler and rejects a second Site Plan authority. | **Narrows implementation.** Reuse D2's closure, namespace, impact artifact, and mutation boundary. **Add D83-R3/R11/R13/R29:** no D83-specific tree, route ledger, or current-state cache. |
| D83-specific capacity thresholds   | Two definitions of “large” would drift and make operational tuning opaque.                                                         | **Medium / High.** Proposed D2 already has a ≥2,000 proof fixture and D33 owns environment evidence.            | **Adds constraint.** Reuse the active D33 profile and D2 proportional view; invent no D83 number. **Add D83-R11/R14/R24.**                                                                 |
| Duplicate receipt or job lifecycle | Lost acknowledgements and repairs could disagree with D80-D82 and create two sources of business truth.                            | **High / Medium.** D80-D82 already require one semantic command and receipt.                                    | **Adds constraint.** Extend the existing receipt with sealed-plan digest, both counts, and outcomes; no D83-specific job/saga receipt. **Add D83-R12/R20/R28.**                            |

### 4. Edge cases

**Material concern exists: Yes.** Same-Page public equality, protected old keys,
mixed private work, deep trees, and unknown history all produce different valid
outcomes.

| Concern                                                                                  | What could go wrong and why it matters                                                                                           | Severity / likelihood / evidence                                                                                 | Effect, permanent fix, and exact language                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Re-derived key equals the same Page's live key                                           | Generic uniqueness might report a collision or create a duplicate private claim when the child merely returns to its public pin. | **High / High without an explicit rule.** D81 restores the source ancestor; this is the expected common outcome. | **Required amendment.** Treat same stable Page + exact public key + no independent delta as public-pin convergence: supersede the old private effect, return to the public Placement result, and create no duplicate private claimant/redundant revision; one clean successor is allowed only by R5. If the old private key differs, retain one sealed-plan/receipt/UI mapping; exclude only true old-key-equals-new-key no-effect members. **Add D83-R6/R7.** |
| Old derived key has protected history or new key collides                                | Root eligibility could be incorrectly inherited, destroying continuity or another owner.                                         | **Critical / Medium.** D2 route classes and D82 require exact-key history, not ancestor inference.               | **Narrows.** Prove every old/new equivalence class independently; any other owner/unknown history blocks. **Add D83-R4/R6.**                                                                                                                                                                                                                                                                                                                                   |
| Compatible versus incompatible descendant draft                                          | Always blocking discards safe work; always preserving could merge a reparent/schedule or overwrite another editor.               | **High / Medium.** D12 separates Placement axes and forbids automatic merge.                                     | **Clarifies.** Preserve an exact acknowledged compatible Placement input already sealed into D2; block stale, unacknowledged, separately scheduled, or semantic change. **Add D83-R8/R10.**                                                                                                                                                                                                                                                                    |
| Root/Home, disabled locale, Trash, maximum depth, Unicode/case/slash/percent equivalence | The closure could compile an invalid or protected path even when its displayed string looks harmless.                            | **Critical / Low-to-Medium.** D2 explicitly owns these checks and equivalence rules.                             | **No invalidation.** Re-run all D2 checks at commit; fail closed. **Add D83-R4/R15.**                                                                                                                                                                                                                                                                                                                                                                          |

### 5. Footguns

**Material concern exists: Yes.** Developer and staff shortcuts could silently
turn a private derivation into data loss or public change.

| Concern                                                           | What could go wrong and why it matters                                                                              | Severity / likelihood / evidence                                                                                                               | Effect, permanent fix, and exact language                                                                                                                                    |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| “Update all children” calls Payload hooks                         | The operation could modify timestamps, validations, content hooks, emails, or integrations unrelated to paths.      | **Critical / High if implemented literally.** Payload documents recursive descendant updates and its hooks can perform arbitrary side effects. | **Changes the phrase, not the outcome.** Forbid child document resave and provider hook authority. **Add D83-R5/R13/R21.**                                                   |
| `SKIP LOCKED` or best-effort authoritative batching               | Busy children would be omitted and the UI could report success on a partial tree.                                   | **Critical / Medium.** Closure conservation requires every member; `SKIP LOCKED` is designed to skip contention, not preserve a complete set.  | **Adds prohibition.** Any unavailable member aborts authoritative commit; only inert D2 prep distribution may skip work without defining membership. **Add D83-R6/R12/R13.** |
| Mandatory checkbox implies consent repairs correctness            | Developers may rely on a UI confirmation instead of constraints/CAS, while staff may approve without understanding. | **High / Medium.** Browser state cannot reserve routes or freeze a closure.                                                                    | **Keeps one action.** Visible server-derived summary; database remains final arbiter. **Add D83-R23/R25.**                                                                   |
| Technical copy exposes “closure,” “claim,” or hidden Page details | Staff cannot act confidently; unauthorized users may learn private IA.                                              | **High / Medium.** Core UI conventions require plain language and permission-safe detail.                                                      | **Adds exact UX.** Use “related draft addresses,” aggregate authority, and generic owner action. **Add D83-R23-R26.**                                                        |

### 6. Tenant safety

**Material concern exists: Yes.** A recursive parent traversal or cache without
scope at every edge can cross Tenant, Site, or locale boundaries.

| Concern                                                   | What could go wrong and why it matters                                                          | Severity / likelihood / evidence                                                                                                                         | Effect, permanent fix, and exact language                                                                                                                                         |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cross-scope edge enters closure                           | D83 could expose or mutate another Tenant/Site/locale Page and corrupt route ownership.         | **Critical / Low with structural constraints; Medium without them.** Current runtime lacks these dimensions; application filters alone are insufficient. | **Narrows activation.** Same-scope composite FKs and scope predicate at every recursive step; any mismatch blocks and alarms. **Add D83-R3/R15/R17.**                             |
| Shared stable Page has multiple Site-locale Placements    | Counting Pages instead of Placement addresses could hide or broaden effects.                    | **High / Medium.** Proposed D1/D2 identity separates Page from exact-locale Placement.                                                                   | **Changes UX/data terms.** Count affected Site-locale draft addresses, not unique Page identities; active workspace supplies unambiguous context. **Add D83-R1/R23/R28.**         |
| Permission-filtered list is mistaken for complete closure | RLS could hide a child from planning instead of denying the command, producing partial success. | **Critical / Medium.** RLS filtering is not proof that hidden rows do not exist.                                                                         | **Adds boundary.** Privileged owner derives complete closure, then effect authorization determines allow/detail; insufficient aggregate authority blocks. **Add D83-R3/R17/R24.** |

### 7. Database, RLS, and authorization safety

**Material concern exists: Yes.** This decision touches hierarchy, immutable
revisions, current heads, route claims, and a privileged multi-row command.

| Concern                                                                   | What could go wrong and why it matters                                                                             | Severity / likelihood / evidence                                                                            | Effect, permanent fix, and exact language                                                                                                                                            |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Nullable/reassignable scope or weak FKs                                   | A row can become orphaned or move across Tenant/Site/locale through an allowed update.                             | **Critical / Medium in current schema.** Current Page tenant/slug are nullable and Tenant delete sets null. | **Blocks current runtime.** Non-null trusted scope, composite FKs, restrictive lifecycle, no caller scope reassignment. **Add D83-R15/R18/R29.**                                     |
| Separate claim uniqueness surfaces                                        | Two typed owners can each “uniquely” own the same effective key.                                                   | **Critical / Medium.** D82 already requires one route namespace across typed claimants.                     | **No new surface.** Use D2's structural current-claim arbiter; prove pre/post exclusivity. **Add D83-R6/R15.**                                                                       |
| `USING` without `WITH CHECK`, missing `SELECT`, or bypassing service path | A permitted old row could be transformed into forbidden scope, or privileged code could skip domain authorization. | **Critical / Medium.** Supabase documents old-row/result-row distinction and service bypass behavior.       | **Adds exact DB contract.** Test grants, `SELECT`, `USING`, `WITH CHECK`, views, functions, Payload, service/BYPASSRLS, migration, import, support, and repair. **Add D83-R17/R18.** |
| Browser performs direct authoritative DML of any cardinality              | Caller-controlled descendants, actor, or audit fields could bypass the sole command even through one-row calls.    | **Critical / Low after grants.** Current and future Data API paths need explicit denial.                    | **Adds prohibition.** No browser/anonymous/ordinary authenticated D83 DML; trusted server context supplies scope/actor/effect. **Add D83-R17/R18.**                                  |
| Closure query is correct but unindexed                                    | Locks last too long, timeouts rise, and concurrency creates operational pressure to weaken safety.                 | **High / Medium.** Recursive/parent/current-head and claim CAS predicates need equality-leading indexes.    | **Adds design proof.** Query-shaped indexes and `EXPLAIN` under D33 fixtures. **Add D83-R16.**                                                                                       |

### 8. Overengineering

**Material concern exists: Yes.** The threat is adding machinery for a rare
private recovery case rather than reusing existing owners.

| Concern                                              | What could go wrong and why it matters                                                               | Severity / likelihood / evidence                                                                         | Effect, permanent fix, and exact language                                                                                                              |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| New workflow/queue/approval/capability               | Staff and engineers must learn and operate a second system; eventual partial states become possible. | **High / Medium.** D2/D12/D80-D82 already own every needed fact and one command.                         | **Preserves Option 1 only in bounded form.** Add no D83 workflow, job lifecycle, capability, approval, or assignment. **Add D83-R1/R13/R14.**          |
| Generic route-transfer or subtree API                | A narrowly safe D82/D83 succession could be reused in unsafe copy/move contexts.                     | **Critical / Medium.** D23 copy and D80 handoff have intentionally different source semantics.           | **Narrow scope.** Keep operation private, same Site/locale, source-cleaning, exact command only. **Add D83-R1/R2/R21.**                                |
| New current-state cache/projection becomes authority | Drift or replay order could decide paths rather than D2 durable facts.                               | **High / Medium.** D2 may use projections for preparation, but commit must fence authoritative versions. | **Adds constraint.** Projections/read models are derived and disposable; D12 resource heads and D2 current claims own result. **Add D83-R11/R12/R28.** |

### 9. UX/UI and user friction

**Material concern exists: Yes.** The flow can either hide multi-Page impact or
overwhelm staff with a release-style review for a private deterministic change.

| Concern                                                            | What could go wrong and why it matters                                                                              | Severity / likelihood / evidence                                                                                                             | Effect, permanent fix, and exact language                                                                                                                           |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Impact is hidden behind disclosure or toast                        | Staff believe one Page changes and cannot form a correct mental model.                                              | **High / High.** The D2 question itself exists because descendant effects are easy to miss.                                                  | **Required amendment.** Always show exact permission-safe count and public/non-public consequence; disclosure hides only mapping detail. **Add D83-R23/R24.**       |
| Full list/confirmation is mandatory                                | Large trees create scrolling, cognitive load, weak-network delay, and abandonment despite no semantic child choice. | **Medium / High at fan-out.** D2 requires proportional review and one closure confirmation; admitted descendants have no independent choice. | **Supports Option 1 subject to AC51 usability proof.** Existing primary action confirms; small exact list and large searchable impact reuse D2. **Add D83-R24.**    |
| Error states collapse into “try again”                             | Staff cannot distinguish stale tree, another Page's work, permission, collision, capacity, and unknown outcome.     | **High / Medium.** Each cause has a different safe repair and retry boundary.                                                                | **Adds persistent cause-owned messages and linked repair.** **Add D83-R25.**                                                                                        |
| URL comparison fails on mobile, zoom, RTL, or assistive technology | Long paths truncate, visual arrows reverse ambiguously, or status changes go unannounced.                           | **High / Medium.** WCAG Reflow requires 320px/400%; status messages need programmatic exposure.                                              | **Adds accessible contract.** Stack old/new paths, wrap/select/isolate, native disclosure/button semantics, polite complete status, visible focus. **Add D83-R26.** |
| Donor is shown an irrelevant migration notice                      | A private operation would create anxiety and imply public change.                                                   | **Medium / Low if boundary is explicit.** D83 leaves D1 unchanged.                                                                           | **Reject donor UI.** Prove public responses/Navigation unchanged. **Add D83-R21/R27.**                                                                              |

### 10. Source of truth, ownership, and domain invariants

**Material concern exists: Yes.** Direct Placement inputs, derived closure
outputs, public serving, and provider breadcrumbs must not become dual-owned.

| Concern                                                     | What could go wrong and why it matters                                                    | Severity / likelihood / evidence                                                                            | Effect, permanent fix, and exact language                                                                                                                                                         |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Payload breadcrumbs become route authority                  | Provider recalculation, D2 claim state, and D1 public output can disagree.                | **Critical / Medium.** ADR-0146 explicitly rejects provider hierarchy as coherent public release authority. | **Changes implementation.** D2 owns derived paths/breadcrumbs and closure; Payload is a qualified persistence adapter only. **Add D83-R3/R13/R29.**                                               |
| Descendant Placement head is advanced unnecessarily         | Meaningless history, stale editor conflicts, and audit noise result from a derived no-op. | **High / Medium.** D12 history is semantic and bounded.                                                     | **Adds invariant.** Preserve head unless accepted D2 storage needs a cause-labelled immutable successor; never mutate or append a pure no-op. **Add D83-R5/R7/R8.**                               |
| Receipt or impact artifact becomes write authority          | Replaying a projection could overwrite current route truth.                               | **High / Low with clear ownership.** Receipts prove effects; they do not own current state.                 | **Adds distinction.** D12 per-resource heads and D2 current claims own state; the sealed plan is prepared input and the receipt is evidence, never another current head. **Add D83-R11/R12/R28.** |
| Navigation or literal links are assumed to follow hierarchy | D83 could silently rewrite separately governed meaning or leave misleading claims.        | **High / Medium.** D2 and D4 are independent; stable-ID and literal references differ.                      | **Narrows.** Navigation never changes; stable IDs remain; literal strings are not rewritten and known incompatible dependencies block through owner. **Add D83-R2/R22.**                          |

### 11. Hidden coupling

**Material concern exists: Yes.** D83 necessarily composes several owners but
must not make one depend on vendor or public-delivery internals.

| Concern                                                      | What could go wrong and why it matters                                                | Severity / likelihood / evidence                                                                      | Effect, permanent fix, and exact language                                                                                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D83 depends on Payload validation/hooks for every descendant | A provider upgrade or unrelated child schema change breaks material-purpose handoffs. | **High / Medium.** Payload recursion invokes child save behavior; D2 only needs Placement facts.      | **Changes implementation.** Use owner adapters over exact Placement/claim facts; qualify provider build, no child body revalidation. **Add D83-R5/R13/R29.**      |
| Public D1 activation is coupled to private cleanup           | A private handoff could publish, invalidate caches, or require deployment systems.    | **Critical / Low after separation.** D1 serving head is authoritative and D83 needs no public change. | **Explicitly decouple.** Public generation and provider/network effects remain unchanged. **Add D83-R21/R27.**                                                    |
| D83 hardcodes D2's physical closure format                   | Future path compiler or storage migration becomes a cross-phase rewrite.              | **High / Medium.** D2's behavior is settled but schema is not.                                        | **Keep behavioral port.** Bind a versioned sealed-plan/adapter contract and prove migration compatibility without a D83-specific table/head. **Add D83-R11/R29.** |

### 12. Failure modes

**Material concern exists: Yes.** The operation spans preparation, an
authoritative transaction, asynchronous projections, and a potentially lost
response.

| Concern                                            | What could go wrong and why it matters                                                                   | Severity / likelihood / evidence                                                                                                      | Effect, permanent fix, and exact language                                                                                                                |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Preparation partially finishes                     | Staff could see or preview a mixture of old/new paths, or a cleanup job could later activate stale work. | **High / Medium at scale.** D2 allows resumable private preparation, but only a finished compatible closure may become authoritative. | **Adds lifecycle.** Prepared chunks are inert, digest-bound, expirable, and discardable; one head/transaction makes result current. **Add D83-R11/R12.** |
| Transaction fails after target/source/claim write  | A target may exist while the source remains dirty, or old descendant claims may disappear.               | **Critical / Medium without one boundary.** D80-D82 already require all-or-none.                                                      | **No compromise.** One shared PostgreSQL transaction, failpoint after every authoritative effect, no repair saga. **Add D83-R12/R19.**                   |
| Provider returns success but DB rolled back        | Staff leave the flow believing work moved and subsequent saves conflict.                                 | **Critical / Low-to-Medium.** Payload documents unawaited hook risk; issue #17457 reports this exact class.                           | **Adds proof.** Await every participant, verify receipt/current heads after commit, reconcile ambiguous response. **Add D83-R13/R19/R20.**               |
| Outbox/projection fails after authoritative commit | UI/search projections lag and staff may retry an already successful command.                             | **High / Medium.** Secondary effects can fail after commit even when business truth is correct.                                       | **Adds recovery.** Receipt is authoritative; outbox is durable/idempotent; stale projections recover without redoing handoff. **Add D83-R20/R28.**       |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern exists: Yes.** Every plan can stale; retries and races must
bind the durable business effect, not one HTTP request.

| Concern                                                          | What could go wrong and why it matters                                                                      | Severity / likelihood / evidence                                                                                 | Effect, permanent fix, and exact language                                                                                                                                                        |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Descendant inserted/reparented/edited between review and commit  | Two individually valid actions jointly violate closure completeness or overwrite work.                      | **Critical / Medium.** D12 expected heads and a structural fence are required; normal UI locks are insufficient. | **Narrows.** Bind exact closure/head/dependency/lease/effect generations and abort on drift. **Add D83-R3/R4/R10/R12.**                                                                          |
| Concurrent route claimant or D1 activation wins                  | D83 could create duplicate ownership or use an obsolete public pin.                                         | **Critical / Medium.** Route namespace and public head are independent concurrent owners.                        | **Adds CAS.** Re-prove claim/public generations and let structural uniqueness decide; loser has zero effect. **Add D83-R4/R6/R12.**                                                              |
| Retry uses transport ID only                                     | A lost response may create a second target or a stale closure may be accepted under the same button action. | **Critical / Medium.** The durable effect spans root, closure, target, and source.                               | **Adds semantic idempotency.** Key + canonical request + sealed-plan digest; identical replay reconciles one effect, changed input conflicts, unknown outcome reconciles first. **Add D83-R20.** |
| Time-based schedule/permission/policy changes during preparation | An otherwise valid closure can become unauthorized or due for a different release effect.                   | **High / Medium.** Preparation may be resumable and permissions/schedules are temporal.                          | **Adds fresh commit proof.** Bind version/effect epochs, never trust preparation timestamp or cached boolean. **Add D83-R4/R11/R12.**                                                            |

### 14. Data integrity risks

**Material concern exists: Yes.** Missing, duplicate, stale, or overwritten
closure members would make route state and History contradictory.

| Concern                                           | What could go wrong and why it matters                                                                                                         | Severity / likelihood / evidence                                                                                                          | Effect, permanent fix, and exact language                                                                                                                                                                                                  |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Old claim has no exhaustive disposition           | A stale private key remains occupied or an old path becomes silently free.                                                                     | **Critical / Medium.** Multi-member succession needs conservation beyond root D82.                                                        | **Required amendment.** Every old effect maps to successor, public-pin convergence, or block; changed-address and disposition digests prove conservation. **Add D83-R6/R12/R28.**                                                          |
| Immutable child revision is updated or relabelled | Historical comparison and restore lie about what staff saved.                                                                                  | **Critical / Medium if “in place” is literal.** D12 requires append-only meaningful checkpoints.                                          | **Changes terminology.** No revision mutation; append a qualified successor only if storage requires it. **Add D83-R5/R8.**                                                                                                                |
| Public-pin convergence creates needless rows      | History/audit growth and lease churn accumulate at scale, while omitting its real old-to-new address mapping would make the staff count false. | **Medium / High without an explicit distinction.** Most descendants may return exactly to their public pin from a different private path. | **Adds precise rule.** Create no duplicate private claimant/redundant revision; allow only R5's required clean successor, count each changed old-to-new address once, and exclude only identical old/new derived keys. **Add D83-R7/R23.** |
| Receipt embeds all private paths                  | Large receipts bloat storage/logs and broaden private IA exposure.                                                                             | **High / Medium.** D2 already requires a searchable impact artifact.                                                                      | **Adds minimization.** Receipt references the authorized sealed-plan digest and both counts; renderable detail stays in an owner-scoped retained artifact. **Add D83-R11/R28.**                                                            |

### 15. Security and privacy risks

**Material concern exists: Yes.** Private hierarchy, paths, titles, editor state,
and actor attribution can leak even if public content does not change.

| Concern                                                 | What could go wrong and why it matters                                                                                        | Severity / likelihood / evidence                                                                 | Effect, permanent fix, and exact language                                                                                                                                                              |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Hidden descendant details appear in impact UI/error/log | Staff learn sensitive ministry/member-care Page existence or internal route design.                                           | **High / Medium.** Cross-resource effect authority does not imply every detail permission.       | **Narrows UX.** Separate complete privileged closure proof from permission-safe aggregate/detail; insufficient informed-action authority blocks. **Add D83-R17/R24/R28.**                              |
| Caller supplies actor, Tenant, owner, or audit fields   | A valid-looking request can reattribute or cross scopes.                                                                      | **Critical / Low after proper boundary.** Multi-tenant mutations must derive trusted context.    | **Adds invariant.** Ignore/reject caller attribution; server derives and constrains every scope/actor/effect field. **Add D83-R18.**                                                                   |
| Preview token is retargeted                             | Someone authorized for the source candidate could see the new target or successor descendant closure without fresh authority. | **Critical / Low.** D12/D81 previews are revision-bound but tokens are not bearer authority.     | **Adds lifecycle.** Old tokens stay old; every use reauthorizes current scope; a successor preview binds its exact sealed plan, `no-store`, `noindex`, and never becomes route truth. **Add D83-R22.** |
| Broad logs/backups/export reveal private URL maps       | Operational systems retain more sensitive IA than necessary.                                                                  | **High / Medium.** Technical telemetry often has broader access/retention than business History. | **Adds minimization.** Owner-authorized retained artifacts hold raw detail; broad telemetry uses opaque IDs/keyed environment tokens, never raw or guessable path hashes. **Add D83-R28.**             |

### 16. Scalability and performance risks

**Material concern exists: Yes.** A hierarchy operation that works for ten
children can fail badly for thousands under contention.

| Concern                                                      | What could go wrong and why it matters                                                                         | Severity / likelihood / evidence                                                                                                          | Effect, permanent fix, and exact language                                                                                                                                                                                  |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One request recursively resaves thousands of child documents | Hook/validation/query amplification causes timeouts, lock growth, DB saturation, and partial-looking failures. | **Critical / Medium.** Proposed D2 explicitly requires ≥2,000 bounded/resumable preparation and no public request-time descendant writes. | **Changes implementation.** Prepare one sealed D2 plan in bounded chunks, then apply only a D33-proved complete authoritative set; otherwise use the truthful fallback. Do not invent a private head. **Add D83-R11-R14.** |
| Full history/tree scan occurs under lock                     | Commit latency grows with total tenant size rather than affected closure.                                      | **High / Medium.** D82 already requires maintained provenance and targeted current facts.                                                 | **Adds bound.** Precompute durable summary, then recheck exact version/digest under short lock; no remote/full scan. **Add D83-R11/R12/R16.**                                                                              |
| No measured maximum or query-plan proof                      | Operators will discover limits in production and may resort to unsafe manual repair.                           | **High / High without D33 cells.** “Large” is not a quantitative contract.                                                                | **Blocks activation.** Populate D33 Minimum/Typical/Measured-max closure cells, query plans, row/lock/receipt limits, SLOs, and fallback. **Add D83-R14/R27.**                                                             |
| Hot roots create lock contention                             | Concurrent edits/handoffs on a common ancestor increase deadlocks and stale reviews.                           | **High / Medium.** PostgreSQL row locks conflict; large tenants amplify it.                                                               | **Adds stable order, bounded timeouts, full retry, and monitor.** **Add D83-R12/R20/R28.**                                                                                                                                 |

### 17. Operational burden

**Material concern exists: Yes.** An opaque or partially repairable feature
would require direct DB fixes and provider expertise.

| Concern                                             | What could go wrong and why it matters                                                      | Severity / likelihood / evidence                                                             | Effect, permanent fix, and exact language                                                                                                                         |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staff need support for every descendant closure     | Self-service goal fails and support needs hidden route knowledge.                           | **High / Medium if failures are generic.** Option 2 is safe but costly as the ordinary path. | **Supports bounded Option 1.** Cause-owned messages and existing D2 repair links handle expected blocks; support cannot override invariants. **Add D83-R14/R25.** |
| Background cleanup/reconciliation needs babysitting | Partial trees, stuck jobs, replay decisions, and manual sequencing become tribal knowledge. | **High / Medium with a saga.** D83 has no externally necessary asynchronous provider effect. | **Reject machinery.** Preparation is resumable/inert; commit is atomic; projections recover from outbox. **Add D83-R11-R13.**                                     |
| No kill switch or repair-forward evidence           | An integrity issue continues across tenants or forces destructive rollback.                 | **Critical / Low but unacceptable.** Cross-scope/partial breach has high blast radius.       | **Adds controls.** Feature/cohort kill switch, authoritative receipts/manifests, forward repair, named on-call response. **Add D83-R27/R28.**                     |

### 18. Observability and auditability gaps

**Material concern exists: Yes.** Technical success, business completion, and
public non-effect need different evidence.

| Concern                                       | What could go wrong and why it matters                                                | Severity / likelihood / evidence                                                   | Effect, permanent fix, and exact language                                                                                                              |
| --------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| HTTP 200/log message is treated as completion | Rolled-back or lost-ack work is reported as moved.                                    | **Critical / Medium.** Payload docs and issue #17457 show this class.              | **Adds receipt reconciliation.** Success requires committed semantic receipt plus current-head read; logs are not business proof. **Add D83-R20/R28.** |
| No member/outcome digest                      | A closure can lose/duplicate a child without detection after projection or migration. | **Critical / Low-to-Medium.** Counts alone cannot prove identity/conservation.     | **Adds durable evidence.** Manifest and receipt bind content digest, count, expected/result outcome digest. **Add D83-R11/R28.**                       |
| Public/provider non-effect is assumed         | A hook could emit cache/search/Vercel/integration work unnoticed.                     | **High / Medium during provider adaptation.** Raw child saves often trigger hooks. | **Adds zero-call spans/counters and snapshot proof.** Any occurrence alerts and kills D83. **Add D83-R21/R28.**                                        |
| UX friction is not measured                   | Correct but frustrating stale/prep behavior remains invisible.                        | **Medium / Medium.** Actual ministry tree sizes/work patterns are unknown.         | **Monitor, not weaken.** Named stale-review rate and staff comprehension/usability evidence. **Add D83-R28.**                                          |

### 19. Dependency and integration risks

**Material concern exists: Yes.** Payload, Supabase/PostgreSQL, Vercel, and
downstream hooks have different ownership and failure semantics.

| Concern                                                  | What could go wrong and why it matters                                                           | Severity / likelihood / evidence                                                                                             | Effect, permanent fix, and exact language                                                                                               |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Payload and Supabase writes use separate transactions    | One side commits and the other rolls back, violating source/target/claim atomicity.              | **Critical / Medium if mixed clients are used.** Payload transaction IDs do not make a separate HTTP/RPC transaction atomic. | **Blocks activation.** One proven PostgreSQL transaction and request context or ordinary D2 fallback. **Add D83-R19/R29.**              |
| Payload upgrade changes nested hooks/locks/transactions  | D83 behavior drifts or fires unexpected child effects.                                           | **High / Medium over time.** Provider behavior is versioned and current issue evidence exists.                               | **Adds adapter qualification.** Pin/qualify exact build and suppress native action; contract tests on upgrade. **Add D83-R13/R27/R29.** |
| Vercel/Google URL-move logic is applied to private paths | D83 emits redirects, cache invalidation, or SEO artifacts for a URL that never changed publicly. | **High / Low after explicit boundary.** Vercel owns delivery primitives; Google guidance concerns actual public URL changes. | **Reject integration.** Zero Vercel/SEO/provider calls and public snapshot proof. **Add D83-R21/R27.**                                  |
| Webhooks/integrations see child saves                    | Notifications or CRM sync can fan out for a derived-only cleanup.                                | **High / Medium if child docs are saved.** CMS hooks commonly attach to save events.                                         | **Avoid child save path; durable outbox emits only the defined D83 business event to eligible consumers.** **Add D83-R13/R21/R28.**     |

### 20. Migration, rollout, and upgrade risks

**Material concern exists: Yes.** Current nullable, flat, incomplete-history
data cannot be declared eligible by a code deploy.

| Concern                                                     | What could go wrong and why it matters                                                            | Severity / likelihood / evidence                                                                       | Effect, permanent fix, and exact language                                                                                                   |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Legacy data is backfilled by current-row inference          | Duplicate/cross-scope paths, missing parents, cycles, or old public effects are falsely admitted. | **Critical / High if rushed.** Current schema lacks D2 scope/history and D82 forbids absence-as-proof. | **Blocks activation.** Full census/quarantine, exact provenance, unknown-history ineligible. **Add D83-R27/R29.**                           |
| Old writer omits hierarchy/claim fences                     | Mixed deployment can create rows new code cannot safely compile.                                  | **Critical / Medium.** Schema constraints alone may not encode every semantic effect.                  | **Adds sequencing.** Expand, shadow, constraints/indexes, old-writer fence, qualified adapter, cohort, contract. **Add D83-R27.**           |
| Rollback tries to reverse committed handoffs                | Source/target History and ownership are destructively relabelled or duplicate claims reappear.    | **Critical / Low.** New authoritative data outlives code rollback.                                     | **Adds roll-forward rule.** Disable new D83, preserve committed facts/receipts, repair forward; no destructive unwind. **Add D83-R27/R28.** |
| Canonicalizer/policy/schema changes during prepared closure | An old sealed plan activates under new semantics.                                                 | **Critical / Medium.** Preparation may span deployments.                                               | **Adds generation fence.** Mixed version fails closed and recompiles. **Add D83-R4/R11/R27.**                                               |

### 21. Testability, traceability, and proof

**Material concern exists: Yes.** “Recalculate correctly” is too vague to prove
authorization, conservation, capacity, and non-effect.

| Concern                                                   | What could go wrong and why it matters                                           | Severity / likelihood / evidence                                                                                                  | Effect, permanent fix, and exact language                                                                                                                                                                           |
| --------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tests assert internal rows rather than user/domain result | A refactor passes while public state changes, History mutates, or UX lies.       | **High / Medium.** Multiple physical designs can satisfy D2.                                                                      | **Adds behavioral acceptance criteria.** Prove stable identities/inputs, exhaustive claims, one receipt, public-delivery/external-provider zero-effect, and visible staff outcome. **Add D83-R1-R29 and AC1-AC60.** |
| No hostile concurrency/authorization matrix               | Happy-path unit tests miss cross-tenant, phantom, replay, and privileged bypass. | **Critical / High without explicit matrix.** These are the dominant risks.                                                        | **Adds production-shaped tests.** RLS/grants/service paths, failpoints, new-child/reparent/claim/D1 races, deadlock/replay. **AC17-AC50.**                                                                          |
| Decision drifts across ADR/spec/tasks/tickets             | Implementers follow stale D82 singleton blockers or different terminology.       | **High / High until reconciled.** ADR0201-0203, D80-D84, living spec, roadmap, Phase 12, future OpenSpec all mention the blocker. | **Adds traceability plan.** Reconcile every artifact and link ADR0204/review; no ticket until OpenSpec delta is current. **Add D83-R29 and traceability table.**                                                    |

### 22. Other development hazards

**Material concern exists: Yes.** Preview provenance, literal dependencies,
rollback semantics, and the next sibling-order decision sit outside the obvious
path-claim analysis.

| Concern                                                       | What could go wrong and why it matters                                                                      | Severity / likelihood / evidence                                                             | Effect, permanent fix, and exact language                                                                                                                                      |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Old preview silently resolves a successor closure             | Private content/access boundaries cross revisions after handoff.                                            | **Critical / Low.** D12/D81 preview identity is exact-revision-bound.                        | **Adds explicit preview rule.** Never retarget; every use reauthorizes, and a successor preview binds its exact sealed plan. **Add D83-R22.**                                  |
| Literal paths are silently rewritten or ignored as stable IDs | Content/integration meaning changes, or stale literal links remain without an owner decision.               | **High / Medium.** Path strings and Page identity references are different facts.            | **Narrows.** No rewrite; known incompatible literal dependency uses existing owner action or blocks. **Add D83-R22.**                                                          |
| Sibling position is inferred from D83                         | The new target can appear in an unintended Page-tree order even though D83 only handles source descendants. | **Medium / High without D84.** D2 owns sibling order and raw rank cannot prove staff intent. | **Resolved separately.** ADR-0205 preserves only positive D2 reviewed-gap provenance or a known append-last default; D83 still changes no sibling order. **D83-R2; ADR-0205.** |
| “Private” is mistaken for low consequence                     | Staff path intent, confidential Page titles, and future publication readiness can still be harmed.          | **High / Medium.** Private state is not public but remains authoritative authoring work.     | **Retains rigorous proof.** Privacy-safe detail, atomicity, History, and capacity apply equally to private work. **Add D83-R4-R28.**                                           |

## Exact normative requirements

### D83-R1 — Exact source-tree scope

D83 SHALL apply only inside one qualified D80-D82 same-Tenant, same-
environment, same-Site, exact-locale material-purpose handoff whose server-
derived descendant Placement-address closure remains source-owned. D83 SHALL
create no new capability, workflow, route owner, or generic subtree operation.

### D83-R2 — Descendant ownership conservation

Every descendant SHALL retain stable Page identity, direct parent, authored
local segment, sibling order, Site/locale, Editorial content, references,
History, Navigation, access, schedules, lifecycle, and public owner facts. The
target SHALL inherit none of them.

### D83-R3 — D2 is the sole closure authority

D2 SHALL derive the complete closure from trusted scoped parent edges and
detect cycles/depth violations. A browser list, count, Payload breadcrumb,
cache, projection, search result, or provider response SHALL NOT be authority.
Closure membership SHALL bind a structural generation or equivalent phantom-
safe fence scoped as narrowly as the accepted D2 model can prove. Unrelated
tree branches SHALL NOT stale the plan unless D2 explicitly qualifies a
coarser generation and its measured contention trade-off.

### D83-R4 — Every member proves current eligibility

At preflight and commit, every member's old/new canonical equivalence class,
public pin, current Placement/claim/dependency head, relevant lease/schedule/
release binding, lifecycle, effect authorization, and current compiler/
canonicalizer/reservation/route-policy/schema/adapter generations SHALL pass.
Ancestor eligibility SHALL NOT imply descendant eligibility. If an unrelated
D1 activation leaves every relevant public Placement pin and route-policy input
identical, the D1 owner MAY refresh the serving dependency without staff re-
review; any relevant selection change blocks.

### D83-R5 — Derived output only; immutable History

D83 SHALL recompute only D2-owned derived private path, breadcrumb, route-delta,
and claim output. Existing revisions SHALL remain immutable. If the accepted D2
representation stores derived output in an immutable Placement Revision, one
D12-fenced cause-labelled successor with identical authored inputs MAY be
appended, including for public-pin convergence when the monotonic Working
contract requires a clean successor. It SHALL NOT append a redundant revision
when the exact public pin can be reused. If D2 retains derived output outside
the descendant revision, the Placement head MAY remain unchanged. A true old-
key-equals-new-key no-effect creates no revision.

### D83-R6 — Exhaustive claim conservation

Each old derived private route effect SHALL map exactly once to a qualified
successor private claim, same-Page public-pin convergence, unchanged current
private effect, or a complete pre-mutation blocker. Public-pin convergence supersedes the obsolete private effect
and returns to the public Placement result without a duplicate private claimant
or redundant revision; one cause-labelled clean successor is allowed only under
D83-R5. A changed old-to-new address remains one sealed-plan/receipt/UI effect.
Missing, duplicated, orphaned, unowned, double-owned, or silently suffixed
results SHALL be impossible.

An unchanged-current-private-effect result requires identical old/new derived
path and corresponding breadcrumb output. It retains the same valid claimant,
appears only in conservation/`closure_member_count`, not
`changed_address_count`, and creates no revision, claimant occurrence, audit
noise, or staff mapping.

### D83-R7 — Same-Page public equality converges to the public pin

When a new derived key equals the same stable descendant's exact current public
canonical key and no independent Placement delta remains, D2 SHALL return that
axis to the public Placement result without a duplicate private claimant or
redundant revision; D83-R5 governs whether one clean successor is required. If
its old private derived key differs, the mapping SHALL remain exactly once in
the sealed plan, receipt, and `changed_address_count`. Only an identical old/new
derived key plus identical corresponding breadcrumb output has no staff-visible
address effect. Equality with any other owner or protected/unknown history
SHALL block.

### D83-R8 — Preserve exact acknowledged authored inputs

An acknowledged independent descendant Placement input MAY remain only when it
is already sealed into the D2 plan, mechanically compatible, and unchanged.
D83 SHALL NOT merge, reparent, reorder, suffix, or reconstruct authored values
from public HTML, provider “latest,” or display paths.

### D83-R9 — Editorial independence

Unrelated descendant Editorial drafts, Working heads, autosaves, leases, and
content validation SHALL remain untouched and SHALL NOT block a path-only
closure merely because they exist.

### D83-R10 — Placement work and lease safety

Unacknowledged, stale, independently changing, incompatible, or separately
scheduled descendant Placement work SHALL block and replan through D2. A
Placement lease SHALL be fenced/taken over only under D12's existing qualified
effect when the accepted adapter must advance that head; D83 SHALL never
silently seize another editor's work.

### D83-R11 — Bounded, resumable, inert preparation

D2 MAY compile one sealed, digest-bound plan/impact artifact in bounded,
resumable chunks; it MAY be content-addressed only if accepted D2 design chooses.
D83 creates no current private closure head. Before commit the plan is non-
authoritative and cannot serve a current/public route or report success. A
complete plan MAY receive an exact authorized plan-bound private preview. It
SHALL bind exact scope, heads, members, old/new outputs, dispositions,
generations, capacity cell, `closure_member_count`, `changed_address_count`, and
digest. Uncommitted preparation MAY expire; every artifact needed to render
committed History or an authorized old preview SHALL be immutable and retained
under D2/D12's governing history policy rather than leaving only a non-renderable
digest. `changed_address_count` includes public-pin convergence when the old
displayed private key differs and excludes a member only when its old/new path
and corresponding breadcrumb output are both identical; breadcrumb-only work
is outside D83's path-change scope.

### D83-R12 — One short atomic D80-D84 transition

One PostgreSQL transaction SHALL reauthorize, fence, apply the exact sealed D2
successor plan through existing Placement/claim boundaries, perform D82 root
succession, create the D80 target, clean/checkpoint the D81 source, append
receipt/audit/outbox, and commit all or none. It SHALL add no private closure
authority head.
Stable IDs SHALL determine lock order; no user/network wait occurs under lock.

### D83-R13 — No recursive provider mutation or partial processing

D83 SHALL NOT recursively resave child documents, invoke one HTTP/provider
write per descendant, expose authoritative partial batches, or use a D83-
specific saga, queue, background cleanup/compensation, or second serving/
closure authority. An existing qualified D2 executor MAY distribute inert
preparation chunks; `SKIP LOCKED` SHALL NOT determine closure membership, omit
an outcome, or participate in authoritative commit/cleanup.

### D83-R14 — Existing D2/D33 fallback and bound

High fan-out SHALL reuse D2's searchable/resumable impact artifact and active
D33 Production Capacity Profile. If the exact adapter cannot prove complete
preparation and an admitted atomic commit, D83 SHALL make zero authoritative
source/target/head/claim/business effects and route staff to the exact ordinary
D2 owner action. Inert preparation may expire or be garbage-collected. If that
owner action cleans/releases the source root claim, D82 adoption ends: the
target path becomes an ordinary unreserved suggestion, must win fresh D2
validation, and may be lost to a competitor. D83 SHALL state that consequence
and invent no threshold.

### D83-R15 — Structural database invariants

Hierarchy, Placement, closure, claim, head, receipt, and audit relations SHALL
use non-null trusted scope, same-scope composite relationships, restrictive
lifecycle/delete behavior, one current Placement head, one current canonical-
key claimant across typed owners, and D2-owned cycle/depth/normalization/
reserved-key/conservation enforcement.

### D83-R16 — Query-shaped indexes and plans

Equality-leading indexes SHALL match scoped parent traversal, exact current-
head, accepted plan-member, claim-CAS, receipt, and authorization predicates.
Production-shaped `EXPLAIN`/load evidence SHALL prove Minimum, Typical, and
Measured-maximum D33 cells.

### D83-R17 — Grants and RLS parity

Browser, anonymous, and ordinary authenticated roles SHALL have no direct D83
DML. Exposed policies SHALL test required `SELECT`, old-row `USING`, result-row
`WITH CHECK`, inserts, deletes, append-only denial, authorized same-scope allow,
permission-hidden members, and cross-scope/cross-Tenant denial.

### D83-R18 — Trusted context and privileged paths

Tenant, environment, Site, locale, actor, author, owner, effect, and audit facts
SHALL come from trusted server context. Payload Local API, views, RPC/functions,
workers, service/`BYPASSRLS`, imports, migrations, support, and repair SHALL
reproduce the same effect/scope rules; caller attribution SHALL be ignored or
rejected.

### D83-R19 — One database transaction

Payload-owned source changes and D2 claim/closure changes SHALL share one
proven PostgreSQL transaction and awaited actor-bound request. A Payload write
plus separate Supabase HTTP/RPC transaction SHALL NOT implement D83.

### D83-R20 — Semantic idempotency and uncertain outcome

The semantic command key SHALL bind the canonical request, sealed-plan digest,
and reviewed relevant-dependency digest. The final relevant serving generation
SHALL be recorded in the committed receipt/audit but SHALL NOT enter the
idempotency key, so a safe D1 dependency refresh is not different input. Identical
replay reconciles the one durable effect, but presentation is reauthorized now:
the full receipt requires current read authority; otherwise D81's non-
enumerating detail-free committed result appears. Changed input conflicts.
Deadlock/serialization retries replay the complete command. A lost response
freezes successor writes and reconciles the effect first.

### D83-R21 — Zero public-delivery, external-provider, and money effect

D83 SHALL change no D1 public generation, public path/breadcrumb/canonical,
Navigation, redirect/repair, cache/search/sitemap, donor result, Vercel/DNS/TLS,
Stripe, currency, gift, recurring, ledger, CRM, email, or other external-
provider/money fact and SHALL make zero associated calls. Qualified same-
database Payload persistence, the durable internal outbox, and permission-safe
Web Studio projection recovery remain allowed implementation effects.

### D83-R22 — Reference and preview boundaries

Stable Page-identity references SHALL remain stable. D83 SHALL rewrite no
literal path string; a known incompatible literal dependency uses its existing
owner action or blocks. Old preview credentials SHALL stay bound to their old
authorized revision/plan. Every use reauthorizes current exact preview/read
scope; denial after access or retention loss is non-enumerating. A token is
routing context, never bearer authority. A prepared or committed successor
preview requires fresh exact plan authority, remains non-authoritative,
`no-store`, and `noindex`.

### D83-R23 — Always-visible, plain-language impact

When effective descendant addresses change, the PageShell handoff review SHALL
show a permission-safe exact `changed_address_count`, state that Pages stay with
the source, and state that private addresses update while the live website and
Navigation do not. It SHALL count affected Site-locale draft addresses, not
stable Pages or the broader `closure_member_count`.

### D83-R24 — Proportional detail and one confirmation

Small closures SHALL use D2's concise exact mappings; high-fan-out closures
SHALL use D2's searchable/resumable impact view. Mapping detail MAY be in an
accessible disclosure, but the count/consequence stays visible. The existing
**Move saved changes to new Page draft** action SHALL be the one closure-level
confirmation; no per-child control or mandatory full-list opening is added.

### D83-R25 — Persistent cause-owned recovery

Preparing, ready, descendant Placement work, permission, route conflict,
stale tree/plan, capacity, proof unavailable, committing, unknown outcome, and
committed states SHALL have truthful persistent copy and the existing owning
repair action. Errors preserve input and never silently retry a different
closure, suffix a path, or rely on a timed toast.

### D83-R26 — Accessibility, internationalization, and weak networks

The surface SHALL reuse Core PageShell/Base UI patterns; preserve one DOM/
visual order, native labels/headings/lists/buttons, 44px targets, visible focus,
320px/400% reflow, forced colors, reduced motion, keyboard/screen-reader
operation, complete polite status messages, bidi-isolated selectable wrapping
paths, and CJK/RTL/long-title behavior. Old/new values SHALL have explicit
semantic labels; any directional arrow is decorative and hidden from assistive
technology. Weak-network and reauthentication flows SHALL preserve the reviewed
plan or truthfully require replan.

### D83-R27 — Safe migration, rollout, rollback, and current unavailability

Activation SHALL use expand, complete hierarchy/route/claim census and
quarantine, exact scope/provenance backfill, shadow compilation, constraints/
indexes, old-writer fence, exact-provider adapter qualification, cohort, then
contract. Old-code/new-data and new-code/old-data readers SHALL remain compatible
or deployment SHALL fence them before cohort activation; at least one qualified
reader must interpret every committed plan/receipt throughout rollback. Mixed
generations fail closed. Rollback disables new D83 and repairs forward from
receipts; it never unwinds committed history. Current `develop` SHALL expose no
interim D83.

### D83-R28 — Durable business evidence and named monitors

One receipt SHALL reference immutable sealed-plan digest,
`closure_member_count`, `changed_address_count`, expected/result heads and
dispositions, actor/effect/scope, reviewed dependency/final serving generations,
outcome, and time. Raw private paths and content-addressed plan digests remain in
authorized business artifacts under owner retention. Broad logs/metrics use
opaque IDs or keyed environment-scoped telemetry tokens, never guessable raw
per-path hashes. Partial/cross-
scope, digest mismatch, public-delivery/external-provider effect, capacity, stale-review, and
unauthorized-detail monitors SHALL have the thresholds, owners, and responses
defined in ADR-0204.

### D83-R29 — Owner-port and traceability requirement

ADR0201-0203, D80-D82, Phase 12, the living spec, roadmap, glossary, proposed
OpenSpec D2/D12/design/tasks, tickets, implementation, tests, and release
evidence SHALL use this exact term and boundary. No implementation ticket may
substitute current Payload recursion or a flat scalar-slug shortcut.

## Domain invariants

1. **I1:** D83 is one disposition inside D80-D84, not an independent workflow.
2. **I2:** D2 alone derives closure membership and canonical output.
3. **I3:** Scope is exactly Tenant × environment × Site × stable locale.
4. **I4:** Every descendant remains the same stable source-owned Page.
5. **I5:** Direct parent, local segment, and sibling order remain unchanged.
6. **I6:** Editorial content and unrelated Working axes remain unchanged.
7. **I7:** Navigation and public D1 state remain unchanged.
8. **I8:** Existing immutable revisions are never updated or relabelled.
9. **I9:** Public-pin convergence creates no duplicate private claimant or
   redundant revision; only R5's required clean successor may append. A real
   old-to-new draft address change remains one visible and receipted sealed-
   plan effect.
10. **I10:** Every old closure member has exactly one exhaustive outcome.
11. **I11:** Same-Page public equality is compatible; every other occupied or
    protected key blocks.
12. **I12:** The authoritative closure is complete and phantom-safe at commit.
13. **I13:** Preparation is inert until the one authority transition.
14. **I14:** The pre/post boundaries expose neither a partial tree nor a route-
    claim gap/duplication.
15. **I15:** The target inherits no descendant-owned fact.
16. **I16:** Stable Page references remain stable; literal paths do not rewrite.
17. **I17:** Unrelated Editorial leases do not block or change.
18. **I18:** Relevant Placement work is preserved or blocks; it is never merged.
19. **I19:** One semantic request creates at most one complete result.
20. **I20:** Ambiguous response never permits a successor mutation before
    receipt reconciliation.
21. **I21:** Authorization is proved for the complete effect, while UI detail
    remains permission-safe.
22. **I22:** Database constraints and D2 mutation rules, not the UI, arbitrate
    hierarchy and claim validity.
23. **I23:** Privileged/provider/import/support paths preserve the same scope and
    effect rules.
24. **I24:** Large closures stay within D2/D33 bounds or use ordinary D2 first.
25. **I25:** No recursive child provider save or partial batch is authoritative.
26. **I26:** Public, Vercel, search/cache, donor, Stripe, and money effects are
    exactly zero.
27. **I27:** Receipt/audit evidence is durable but never current route authority.
28. **I28:** Disabling D83 cannot erase or destructively unwind committed
    source/target/closure History.

## Lifecycle and valid transitions

| State                           | Valid next state                                                                 | Forbidden result                                          |
| ------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------- |
| No descendant effect            | Ordinary D80-D82 ready/commit                                                    | Fabricate D83 rows or UI                                  |
| Candidate closure detected      | Preparing a sealed D2 plan or exact ordinary D2 owner action                     | Trust browser list/count                                  |
| Preparing                       | More bounded preparation, cancelled/discarded, stale, or ready                   | Current/public or previewable incomplete closure          |
| Ready                           | Reauthorize/commit, stale/replan, cancel, or capacity fallback                   | Reserve or mutate children during review                  |
| Stale/incompatible/inaccessible | Ordinary D2 repair then fresh preparation                                        | Merge, overwrite, suffix, support override                |
| Over active D33 bound           | Exact ordinary D2 owner action with root-claim consequence                       | Promise D82 address retention, saga, or partial commit    |
| Committing                      | Committed receipt or complete rollback                                           | User/network wait; public-delivery/external-provider call |
| Deadlock/serialization loss     | Complete rollback then fresh full-command retry                                  | Retry one child or reuse stale digest                     |
| Response unknown                | Receipt reconciliation                                                           | New command/edit before outcome known                     |
| Committed                       | Authorized receipt/read, target editor, projection recovery                      | Automatic reversal, source reclaim, token retarget        |
| Later source restore            | Ordinary D2 validation against target and current D2 Placement/route-claim state | Reclaim/suffix/overwrite target key                       |

Cancellation before commit discards or expires only inert preparation; it
changes no authoritative source, target, claim, head, public, external-provider,
or business fact. Correction after commit is a new ordinary owner-governed
successor, never mutation of D83 History.

## Logical data contract without premature schema freeze

D83 requires these logical records/relationships, normally supplied by the
accepted D2/D12/D80-D82 design:

| Fact                    | Authoritative owner                 | Minimum durable content                                                                                                     | Never authoritative                                |
| ----------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Direct Placement input  | D2/D12 immutable Placement Revision | scoped Page, parent, local segment, sibling order, revision/profile                                                         | UI field cache, public HTML, breadcrumb string     |
| Sealed closure plan     | D2 accepted plan/impact artifact    | root, scoped members, expected heads/dependencies, old/new output digests, dispositions, versions, both counts, plan digest | browser list, search projection, provider result   |
| Canonical key ownership | D2 route namespace                  | scoped canonical equivalence class, one current typed claimant, immutable occurrence History                                | `SELECT`-then-`INSERT`, Payload slug, Vercel route |
| Working/lease state     | D12                                 | exact resource head, expected revision, session lease generation                                                            | provider updated time, editor name alone           |
| Public truth            | D1                                  | immutable Public Site Generation plus sole serving head                                                                     | D83 sealed plan, preview, latest Payload row       |
| Business completion     | D80-D84 semantic receipt            | request/plan/dependency digests, both counts, source/target/result heads, disposition digest, actor/effect/time             | HTTP status, toast, technical log                  |
| Staff read model        | Web Studio projection               | permission-safe count/detail and owner action derived from the above                                                        | mutation authority                                 |

The accepted D2 design may use the sealed plan to drive a bounded set-based
transaction or another qualified representation inside the measured D33
maximum. It SHALL NOT add a current private closure head or combine competing
authorities. Uncommitted plan chunks may expire; every artifact needed to render
committed History or an authorized old preview remains retained under the
governing owner policy.

## Final staff, Tenant, and donor experience

### Ready state

The one main-column reading order is:

1. existing D79 material-purpose explanation;
2. target title, Parent Page, Web address, and complete tenant-branded private
   URL;
3. always-visible related-address summary;
4. optional exact D2 impact detail/search;
5. existing target/source outcome rows; and
6. one **Move saved changes to new Page draft** action.

Recommended copy:

> **2 related draft addresses will update**  
> These Pages stay under About. Their private addresses will be recalculated
> from About's current `/about` location. Their live addresses and Navigation
> will not change.
>
> **Review 2 address changes**

Expanded compact mapping:

> **Our team · Draft address change**  
> **Current saved address:**  
> `https://hoperelief.org/serve/short-term-teams/our-team`  
> **After the handoff:** `https://hoperelief.org/about/our-team`  
> **Live address stays:** `https://hoperelief.org/about/our-team`

“Related draft addresses” is more accurate than “children” for staff who think
in Pages rather than data structures, while the body makes source-tree
membership explicit. **Recalculate** truthfully describes derived output;
**move** is reserved for the material-purpose candidate to the new Page.

### Failure and recovery

The exact messages in D83-R25 remain inline and persistent. A generic message
is used when naming the blocked Page/path would exceed read authority. If the
actor has authorized detail, the mapping row names the Page and precise owner
cause. Staff never see a partial “all clear,” and they never lose entered target
fields when the tree must be replanned.

The existing primary action is disabled only while a server result is required
to know whether submission is safe. The page remains readable. Status updates
announce settled meaningful changes, not every keystroke or chunk. Preparation
may continue/recover through D2's existing progress surface; no modal traps
focus or forces staff to watch it.

### Success

> **Saved changes moved**  
> Short-term team application is a private draft. About and its 2 related
> Pages remain in their current Page tree. Their private addresses were
> recalculated. Nothing was published, and Navigation did not change.

The target editor appears only with fresh target read/edit and lease authority.
Otherwise D81's detail-free committed result applies. No **View live Page**
action appears for the private target.

### Donor and public surfaces

There is no D83 donor or visitor surface. Before and after commit, `/about`,
`/about/our-team`, Navigation, canonicals, branding, forms, giving links,
checkout, currency, recurring schedules, and ledger results continue from the
same activated D1/provider owners. This non-change is an acceptance criterion,
not an assumption.

## Acceptance criteria and proof matrix

### Functional and boundary outcomes

1. **AC1:** With zero effective descendant path/key and corresponding
   breadcrumb-output changes, D80-D82 proceeds with
   no D83 summary, changed-address entry, revision, claim, or audit noise;
   conservation may still prove a zero-change sealed member without presenting
   it as affected.
2. **AC2:** One qualified changed-address descendant shows one exact mapping and
   commits one complete source/target/closure receipt.
3. **AC3:** Several qualified descendants show the exact authorized affected
   address count and exhaustive outcomes.
4. **AC4:** The deepest admitted tree compiles without recursion overflow,
   cycle ambiguity, or path truncation.
5. **AC5:** A fixture affecting at least 2,000 descendants prepares in bounded,
   searchable, resumable D2 chunks. It commits only when the active D33 D83 cell
   admits the complete authoritative transition; otherwise AC41's truthful
   zero-authoritative-effect fallback applies.
6. **AC6:** A same-Page exact public-key result supersedes the obsolete private
   effect and returns to the public Placement result with no duplicate private
   claimant or redundant revision. One cause-labelled clean successor is
   allowed only when D83-R5's accepted representation/monotonic head requires
   it. A differing old private key appears once in the sealed plan, receipt,
   mapping, and `changed_address_count`; an identical old/new key appears in
   none of those changed-address counts.
7. **AC7:** A different valid derived key leaves exactly one current private
   descendant claimant after commit.
8. **AC8:** Every descendant stable Page identity is byte/equality unchanged.
9. **AC9:** Every descendant direct parent, local segment, sibling order, Site,
   and locale input is unchanged.
10. **AC10:** No prior Editorial or Placement Revision row is updated,
    relabelled, reassigned, or deleted.
11. **AC11:** Unrelated descendant Editorial content, Working heads, drafts,
    autosaves, and leases remain unchanged.
12. **AC12:** Navigation revisions/items and current public Navigation remain
    unchanged.
13. **AC13:** Stable Page-identity references still identify the same Page and
    compile through the appropriate current Placement.
14. **AC14:** Literal path strings are neither silently rewritten nor treated
    as stable Page references.
15. **AC15:** Old preview credentials remain bound to old authorized state; a
    prepared or committed successor preview binds its exact plan, reauthorizes
    current exact scope on every use, denies non-enumerating after access/
    retention loss, remains non-authoritative, and is `no-store`/`noindex`.
    GC/prune cannot remove a retained renderable plan referenced by committed
    History/preview; after an authorized retention prune, Core denies rather
    than reconstructing from a digest or current state.
16. **AC16:** Receipt sealed-plan digest, `closure_member_count`,
    `changed_address_count`, and every authoritative member outcome reconcile
    exactly with the committed D2 result and retained renderable evidence.

### Negative, edge, and authorization outcomes

17. **AC17:** Identical semantic replay reconciles the original durable effect,
    reauthorizes presentation now, returns full detail or D81's non-enumerating
    committed result accordingly, and creates no second target, closure, claim,
    revision, audit, or outbox business effect.
18. **AC18:** Reusing the semantic key with a different request or sealed-plan
    digest conflicts and changes nothing.
19. **AC19:** Protected history on any old member key blocks the whole handoff.
20. **AC20:** Another owner on any new equivalent key blocks the whole handoff.
21. **AC21:** Unknown, incomplete, imported, or migration-ambiguous route
    history blocks rather than inferring eligibility.
22. **AC22:** Root/Home, reserved, system, specialized source-owned, safety,
    repair, continuity, or Trash-held route effects block correctly.
23. **AC23:** A cross-Tenant, cross-environment, cross-Site, or cross-locale
    parent/member edge is structurally rejected through every writer.
24. **AC24:** Disabled locale, deleted/Trash Page, stale parent, or invalid
    lifecycle state yields its existing owner action and zero authoritative
    source/target/head/claim/business effects; inert preparation may expire or
    be garbage-collected.
25. **AC25:** Independently reparented/reordered/renamed or unacknowledged
    Placement work blocks; a sealed compatible acknowledged input is preserved.
26. **AC26:** An unrelated Editorial lease neither blocks nor changes.
27. **AC27:** A relevant Placement lease/head is preserved with a dependency
    refresh or blocks under D12; it is never silently taken over.
28. **AC28:** An incompatible scheduled release/unpublish or current safety
    dependency blocks with the owning cause.
29. **AC29:** A permission-hidden member never disappears from closure proof;
    authorized aggregate detail or a permission-safe blocker replaces leakage.
30. **AC30:** Browser-only unsaved Placement work cannot be called saved or
    silently discarded; staff receive the existing save/review action.
31. **AC31:** Self-parent, cycle, maximum-depth, excessive-length, Unicode,
    case, slash, percent-decoding, and locale-prefix property cases produce the
    same D2 result through UI/API/import/migration/service paths.

### Concurrency, failure, and database outcomes

32. **AC32:** A concurrent new descendant after preparation changes the
    structural fence and aborts the old plan with zero effects.
33. **AC33:** A concurrent descendant reparent/edit/head advance loses or wins
    cleanly; no merge or overwrite occurs.
34. **AC34:** A concurrent canonical-key claimant is resolved by the D2
    constraint/CAS; exactly one command wins and the loser has zero effects.
35. **AC35:** An unrelated D1 activation that selects the exact same relevant
    public pins/policy inputs may refresh the dependency without staff re-
    review; any relevant public-pin or route-input drift invalidates the plan
    and preserves the current public generation.
36. **AC36:** Canonicalizer, route-policy, schema, adapter, or closure compiler
    generation drift invalidates and recompiles rather than activating stale
    output.
37. **AC37:** Permission/effect revocation between preparation and commit stops
    the command and discloses no unauthorized detail.
38. **AC38:** A failpoint after every authoritative target/source/claim/current-
    Placement-head/plan-provenance/checkpoint/receipt/audit/outbox write proves
    complete rollback or one committed receipt—never partial success.
39. **AC39:** Deadlock/serialization abort retries the full canonical command in
    stable order; it never retries one member.
40. **AC40:** Lost acknowledgement freezes successor writes, reconciles the
    receipt, and returns committed success or safe retry without duplication.
41. **AC41:** A closure over the active D33 bound performs zero authoritative
    source/target/head/claim/business mutation and routes to the exact ordinary
    D2 owner action. Inert preparation may be discarded. A fixture where that
    action releases the root claim and a competitor wins proves the target then
    receives an ordinary collision—never reservation, adoption from History,
    overwrite, or suffix.
42. **AC42:** No authoritative commit/cleanup path uses `SKIP LOCKED`, partial
    batches, one child HTTP write per member, unawaited hook, saga, or cleanup
    compensation. An existing qualified D2 executor may distribute only inert
    preparation chunks and can never let skipped work define membership.
43. **AC43:** An authorized same-scope actor with every required effect can
    prepare, inspect authorized detail, and commit.
44. **AC44:** RLS tests separately prove required `SELECT`, old-row `USING`,
    result-row `WITH CHECK`, insert/delete rules, and unchanged forbidden rows.
45. **AC45:** Anonymous/browser/ordinary authenticated roles have no direct
    closure/claim/head/revision/receipt DML grant.
46. **AC46:** Payload Local API, RPC/function, view, worker, service/
    `BYPASSRLS`, import, migration, support, and repair paths pass the same
    scope/effect allow/deny matrix.
47. **AC47:** Cross-Tenant actors and Tenant members lacking one required effect
    cannot enumerate or mutate the closure even with guessed IDs.
48. **AC48:** Revision, claim-history, receipt, and business-audit immutability
    is enforced through every write role. Raw private paths/titles and plan
    digests remain only in owner-authorized artifacts under existing retention/
    deletion/export/backup rules; broad receipts/logs/traces/metrics/exports use
    safe counts, opaque IDs, or keyed environment-scoped telemetry tokens—not
    raw or guessable per-path hashes.
49. **AC49:** At every committed boundary the route namespace structurally has
    at most one current typed claimant for each effective key and all old
    member effects reconcile.
50. **AC50:** Production-shaped query plans use intended parent/head/member/
    claim/receipt/authorization indexes within every active D33 cell.

### UX, accessibility, rollout, and public non-effect outcomes

51. **AC51:** Ready review always shows the exact permission-safe affected
    address count plus source-tree/public/Navigation consequence without
    opening a disclosure. Moderated collapsed-view tasks prove representative
    staff can state what becomes the new private Page, that descendants remain
    under the source, how many saved addresses change, that live website/
    Navigation do not change, and the correct owner action after each blocker—
    without facilitator correction. Evidence includes mobile/zoom/screen-reader/
    weak-network cohorts and ratifies any later friction threshold.
52. **AC52:** Mapping disclosure is a real accessible button with correct
    expanded state/relationship; opening it is never required for a
    mechanically qualified closure.
53. **AC53:** Small closures use concise exact mappings and large closures use
    the existing searchable/resumable D2 view; no D83-specific threshold or
    component exists.
54. **AC54:** Preparing, stale Placement, permission, collision/protection,
    capacity/root-claim consequence, proof unavailable, committing, unknown
    outcome, and success copy match D83-R25, preserve fields, and lead to the
    correct owner action.
55. **AC55:** Keyboard and screen-reader tests prove logical focus, linked
    error summary, no focus theft, complete polite status announcements, and
    one primary action.
56. **AC56:** 320-CSS-pixel/400-percent, forced-colors, reduced-motion, RTL,
    CJK, long-title, and bidi URL tests retain all information/function; paths
    use explicit current/after/live semantic labels, stack, wrap, remain
    selectable, and do not truncate; any arrow is decorative/AT-hidden.
57. **AC57:** Weak/offline/interrupted network and reauthentication tests never
    call a browser queue “saved,” lose entered target values, or allow mutation
    before receipt reconciliation.
58. **AC58:** D83 issues no D1 serving-head write. In an isolated run the head
    and route/body/status/canonical/breadcrumb/Navigation/search/cache inputs,
    giving links, branding, and donor-visible results are identical. With an
    unrelated concurrent activation, only that independent head change appears
    and every D83-relevant public output remains identical.
59. **AC59:** Spies/qualification evidence prove zero public-delivery Vercel,
    DNS/TLS, redirect, cache/search, Stripe, ledger, CRM, email, and external-
    integration calls from D83. Qualified same-database Payload persistence,
    internal outbox delivery, and private Web Studio projection recovery remain
    allowed and separately proved idempotent/non-authoritative.
60. **AC60:** Migration and mixed-version rehearsals quarantine bad legacy
    state, fence old writers, exercise old-code/new-data and new-code/old-data
    readers after committed D83 state, retain/fence at least one compatible
    reader throughout rollback, fail closed on incompatible generations,
    activate only the qualified cohort, and disable/repair forward without
    destructive rollback.

## Production monitors

| Signal                              | Threshold                                                                                                                                                                                                                                                                 | Owner                             | Required response                                                                                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `D83_PARTIAL_OR_CROSS_SCOPE_EFFECT` | Any occurrence                                                                                                                                                                                                                                                            | Data Integrity + Security on-call | Disable D83 globally or for proved cohort; preserve evidence; fence affected scope; reconcile receipts/claims; repair forward; rerun authorization suite. |
| `D83_CLOSURE_RECEIPT_MISMATCH`      | Any member/count/disposition digest mismatch                                                                                                                                                                                                                              | Web Studio + D2 owner             | Stop new handoffs; verify structural/compile generations and authoritative claims; repair from immutable history.                                         |
| `D83_PUBLIC_OR_EXTERNAL_EFFECT`     | Any public-delivery route/Navigation/search/cache, Vercel/external-provider, or money effect or call                                                                                                                                                                      | Web Platform on-call              | Kill-switch D83; restore authoritative D1 result; investigate boundary breach; requalify adapters before reactivation.                                    |
| `D83_TRANSACTION_BUDGET`            | Any hard per-attempt limit or evidence-qualified alert ceiling in the active D33 scenario is breached                                                                                                                                                                     | Database/SRE                      | Lower admitted closure maximum, use the truthful D2 fallback, inspect plans/locks, and requalify before raising it.                                       |
| `D83_STALE_REVIEW_BURDEN`           | The non-null evidence-qualified stale-plan ceiling in the launch Operational Qualification Attachment is breached; that attachment defines numerator (ready plans rejected solely for freshness), denominator (eligible prepared submissions), window, and minimum sample | Web Studio Product + Platform     | Review dependency scope, Placement/head churn, and preparation timing; improve freshness/recovery without weakening CAS.                                  |
| `D83_UNAUTHORIZED_DETAIL`           | Any unauthorized count/title/path/owner/Site/locale disclosure                                                                                                                                                                                                            | Security on-call + Web Studio     | Disable affected projection/detail, invoke incident response, correct grants/RLS/adapter, and rerun negative tests.                                       |

## Migration and release order

1. **Recorded now:** ADR-0204 is ratified and the glossary, ADR0201-0203,
   D80-D82 reviews, Phase 12, living spec, roadmap, and decision log are
   reconciled in this documentation workspace.
2. **Required before tickets:** amend proposed OpenSpec D2/D12 and design/tasks with D83-R1-R29 and
   AC1-AC60 before ticket publication.
3. Implement/qualify D1/D2/D12/D80-D82 first; D83 cannot precede its owners.
4. Expand schema and run complete hierarchy/claim/history census; quarantine
   bad or unknown rows rather than auto-correcting them.
5. Backfill exact Site/locale/direct-parent/public-private provenance and shadow
   compile sealed plans/impact artifacts without exposing D83.
6. Add constraints and query-shaped indexes; prove grants/RLS and privileged
   parity; fence every old writer/provider native action.
7. Qualify the exact Payload/PostgreSQL transaction adapter and D33
   Minimum/Typical/Measured-maximum cases with failpoints and zero-external-
   provider/public-delivery spans.
8. Run staff usability/accessibility and weak-network proof on representative
   small/deep/high-fan-out/conflict cases.
9. Enable a limited observable cohort with the six monitors and immediate kill
   switch; expand only after evidence passes.
10. Prove old-code/new-data and new-code/old-data readers, retain one compatible
    reader for every committed D83 state, then contract away legacy paths.
    Rollback disables new commands and repairs forward; it never rewrites
    committed History.

## Documentation reconciliation and traceability status

| Artifact                                      | Recorded/current requirement                                                                                                                            |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Glossary                                      | Recorded Atomic Source-tree Draft-path Re-derivation and removed the unresolved-descendant boundary.                                                    |
| ADR-0201                                      | Recorded qualified D83 closure/fallback and linked ADR-0204.                                                                                            |
| ADR-0202                                      | Recorded related-address consequence review, atomic boundary, and corrected focus behavior.                                                             |
| ADR-0203                                      | Recorded the exact D83 qualified closure exception while preserving every other exclusion.                                                              |
| D80 review                                    | Replaced the temporary descendant blocker with ADR-0204 and reconciled target position through ADR-0205.                                                |
| D81 review                                    | Replaced pending-D83 text with the qualified closure/fallback and no-transfer rule.                                                                     |
| D82 review                                    | Reconciled D82-R6, I21, lifecycle, errors, AC13/AC49, synthesis, and activation.                                                                        |
| Living spec and roadmap                       | Extended the target through D84 with bounded preparation, exact placement UX, and no public-delivery/external-provider effect.                          |
| Phase 12 clarification                        | Recorded D2 as closure owner and Phase 12 effect evaluation with no new D83 capability.                                                                 |
| Proposed OpenSpec PR #1340                    | Add D83 scenario/negative cases to D2/D12 and design/tasks once current branch is reconciled; do not edit the blocked proposal silently from `develop`. |
| Tickets/implementation/tests/release evidence | Carry exact term, R1-R29, AC1-AC60, owner boundaries, D33 proof, six monitors, and current-runtime unavailability.                                      |

## Final disposition

**Accept with required amendments.**

The founder's outcome is correct. The amended implementation meaning is
mandatory: stable source descendants plus atomic D2-derived closure change,
not “update child Pages in place.” The strongest alternative—ordinary D2
owner action—remains the automatic fallback wherever the result is not fully
deterministic, authorized, bounded, and atomically provable, with explicit
warning that root cleanup can end D82 adoption and release the suggested path.

## Exact corrected decision to record

> **D83 — Atomic Source-tree Draft-path Re-derivation.** During a qualified
> D80-D82 material-purpose handoff, when cleaning the source ancestor changes
> private derived addresses and their corresponding breadcrumbs for same-scope descendants that
> remain in the source tree, D2 shall prepare the complete exact closure and
> atomically establish its qualified successor as part of the one D80-D84
> transaction. Descendant stable identity, source ownership, direct parent,
> authored segment, sibling order, every existing immutable History row, Editorial content,
> Navigation, permissions, schedules, references, public generation, and every
> other owner fact remain unchanged. Existing revisions are never mutated;
> D2 appends a cause-labelled successor only if its accepted storage contract
> requires one.
>
> Each old private derived effect in the sealed closure shall have exactly one qualified
> successor, same-Page public-pin convergence, unchanged-current-private-effect
> result, or complete blocker. Public-pin
> convergence creates no duplicate private claimant or redundant revision; one
> cause-labelled clean successor may append only when the accepted D2
> representation/monotonic head contract requires it. A real old-to-new address
> change remains once in the sealed plan, receipt, `changed_address_count`, and
> UI; every other collision,
> protected/unknown history, stale/inaccessible member, incompatible Placement
> work, or over-capacity closure blocks before authoritative mutation and uses
> its exact ordinary D2 owner action. If that action releases the source root
> claim, D82 adoption ends and the unreserved target address may be lost.
> Preparation may be bounded and resumable, but only one D33-admitted atomic
> business transition may commit. Core shall add no provider-recursive child
> saves, authoritative partial batches, D83-specific saga/workflow/capability/
> route engine, or public-delivery/Vercel/search/cache/donor/money effect.
>
> Staff see an always-visible permission-safe affected address count and plain
> statement that Pages stay with the source and the live website/Navigation do
> not change; exact mappings remain proportional detail. The existing **Move
> saved changes to new Page draft** action is the one closure confirmation.

## D84 resolution and branch closure

ADR-0205/D84 resolves the fresh target's position through positive D2 reviewed-
boundary or known append-last provenance, validated/resolved against one post-
D81/D82/D83 final baseline. Only the sealed predecessor effects may advance
affected heads; D84 causes no additional source/descendant parent/order write
and preserves final-cohort relative order. D83's scope remains unchanged.
Unknown/stale position provenance uses ordinary D2 review. The D80-D84 handoff
branch has no further founder-level Placement decision.

## References

- [ADR-0205 - Reviewed sibling placement with append-last default](../../adr/0205-reviewed-sibling-placement-with-append-last-default.md)
- [Phase 24 D84 adversarial review](./phase-24-d84-reviewed-sibling-placement-adversarial-review.md)
- [ADR-0204 - Atomic Source-tree Draft-path Re-derivation](../../adr/0204-atomic-source-tree-draft-path-rederivation.md)
- [ADR-0203 - Atomic Draft-path Adoption](../../adr/0203-atomic-adoption-of-exact-draft-only-page-path-claims.md)
- [ADR-0202 - Atomic material-purpose Page handoff](../../adr/0202-atomic-material-page-handoffs-append-clean-source-revisions.md)
- [ADR-0201 - Material-purpose changes create independent Pages](../../adr/0201-material-purpose-changes-create-independent-pages.md)
- [Proposed ADR-0146 - Staged hierarchical public paths](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0146-staged-hierarchical-public-paths-under-coherent-site-generations.md)
- [Proposed Web Studio OpenSpec D2](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/openspec/changes/add-web-studio-cms/specs/web-studio-cms/spec.md)
- [Proposed ADR-0156 - Working Revisions and active editor](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
- [Payload Nested Docs](https://payloadcms.com/docs/plugins/nested-docs)
- [Payload transactions](https://payloadcms.com/docs/database/transactions)
- [Payload nested-doc rollback issue #17457](https://github.com/payloadcms/payload/issues/17457)
- [Sanity hierarchy](https://www.sanity.io/docs/content-lake/hierarchy)
- [Sanity transactions](https://www.sanity.io/docs/content-lake/transactions)
- [WordPress Page hierarchy](https://wordpress.org/documentation/article/create-pages/)
- [PostgreSQL recursive queries](https://www.postgresql.org/docs/current/queries-with.html)
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL locking](https://www.postgresql.org/docs/current/explicit-locking.html)
- [PostgreSQL serialization retry](https://www.postgresql.org/docs/current/mvcc-serialization-failure-handling.html)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Vercel rewrites](https://vercel.com/docs/routing/rewrites)
- [Google URL-change guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- [WCAG 2.2 Redundant Entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html)
- [WAI disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)
- [WCAG 2.2 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [WCAG Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)
- [WCAG Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
