# Phase 24 D81 — Material-purpose Page Handoff append-and-clean adversarial review

**Decision date:** 2026-08-31

**Founder answer reviewed:** Option 1 — move the saved candidate and clean the
original atomically.

**Repository status:** planning authority only; no runtime, schema, migration,
Supabase policy, OpenSpec delta, ticket, Vercel configuration, Stripe state,
deployment, or production state changed.

## Final disposition

**Accept with required amendments.** The selected direction is the best
permanent answer because it leaves one active private target for the moved Page-
owned intent, returns the sealed source Page-owned heads to their public pins,
preserves recoverable history, and adds no transferred-draft lifecycle. It is also the
closest fit to proposed ADR-0156's one-Working-head and append-only recovery
model.

The raw phrase **move and clean** is unsafe unless narrowed:

1. **Move changes active intent, not history.** The exact source candidate is a
   logical handoff event grouping independently protected per-axis D12
   checkpoint pins. Cleaning appends new private source
   successors from the exact revisions pinned by the current D1 public
   generation; it never deletes, overwrites, relabels, or calls raw provider
   restore.
2. **Target content is a deterministic transfer result, not a byte clone.**
   D80/D23 creates fresh identities, materializes Page-local content, validates
   references, and reports repairs. The exact untransformed candidate remains
   recoverable in source history.
3. **Separate owner axes stay separate.** Editorial and Placement are an exact
   reviewed pair. Only a changed sealed axis gets a successor; unchanged axes
   do not generate no-op history, and Navigation/shared/global/schedule or
   other owners never reset implicitly.
4. **Creation, checkpoint, source-head advancement, lease fencing, receipt,
   audit, and outbox are one transaction.** Any failure leaves the source
   candidate and lease intact and creates no target. A stale tab cannot save
   after success.
5. **Recovery is durable but governed.** Ordinary Payload version pruning may
   not break the protected checkpoint, yet `protected` does not mean immortal
   or outside authorized retention, privacy, deletion, or legal-hold policy.
6. **The UI is one explicit inline review.** It names both outcomes, warns that
   staff must separate any old-Page correction before moving, uses one truthful
   action, and provides compare/history recovery without a second modal,
   semantic merge, bespoke Undo, or extra workflow.
7. **The one safe draft-path exception is D2-owned.** ADR-0203/D82 may
   supersede only the exact sealed Draft-only Path Claim and append a fresh
   target claim in the same transaction after complete positive route-effect
   proof. Private source History remains intact; public/protected routes never
   transfer.

No standard or CMS source names this exact composite operation as universal
best practice. The constituent practices are current and proven: independent
private drafts, append-only revision recovery, revert-by-new-version, explicit
review, expected-head concurrency, transactional writes, idempotent receipt
reconciliation, least authority, and accessible status. Sanity also documents
the exact leftover-draft hazard. Atomic copy-plus-clean is Core's bounded and
justified composition of those practices—not a vendor feature claim.

## Exact corrected decision to record

> After an authorized D79 material-purpose choice and a valid D80 plan, Core
> SHALL offer one final **Move saved changes to new Page draft** action. In one
> short expected-head, semantic-idempotent transaction, it SHALL create the
> complete private D80 target; append one named logical handoff event grouping
> independently resource-scoped protected D12 checkpoint pins for the exact
> source Editorial/Placement candidate pair; append a private source
> successor for each changed source-owned axis from the exact authoritative
> revision pinned by the same current D1 public generation; advance those
> source Working heads; fence every old lease generation in the sealed source
> Editorial/Placement pair; and append the receipt, durable business audit, and
> outbox. It SHALL do all of those or none.
>
> The source candidate SHALL never be deleted, overwritten, relabelled,
> reconstructed from public HTML/provider `latest`, or restored through a raw
> provider endpoint. Unchanged axes receive no no-op version. Separately owned
> Navigation, shared/global content, schedules, comments, approval, public,
> protected-route, continuity, operational, provider, and money facts remain
> unchanged.
> The target SHALL contain the D80 transfer compiler's fresh-identity,
> validated result—not copied authority or byte-identical provider state.
> ADR-0203 permits D2 to replace only the exact sealed source Draft-only Path
> Claim with a fresh target claimant-ownership occurrence/version in this same
> transaction; it never reassigns
> the immutable source Placement Revision or transfers public route authority.
>
> Commit SHALL rederive scope and actor and revalidate source/target effects,
> exact candidate and public pins, D79/D80 state, leases, heads, schedule,
> manifest, schema, route claim, and constraints. Unsaved browser work, drift,
> collision, revocation, incompatibility, or any write failure preserves the
> source and creates no target. Exact replay returns the one receipt without a
> second checkpoint, successor, target, audit effect, or lease change; changed
> input conflicts. Unknown outcomes reconcile the receipt before source edits
> or retry resume.
>
> The inline review SHALL show **New Page - Private draft** and **About - Stays
> live; these Page changes leave its draft**, state that nothing is published,
> separately managed content stays unchanged, and the exact candidate remains
> protected in History, and say **If
> any of these changes still belong on About, go back and separate them before
> moving.** Success opens the target with a persistent **Saved changes moved
> from About. About stays live; these moved Page changes are no longer active
> there. Separately managed content was not changed. Nothing was published.**
> result only after fresh target read/edit authority and ordinary target-lease
> acquisition; otherwise it shows a detail-free committed confirmation. Source
> Editorial/Placement history authorize independently, and the receipt-bound
> initial target link requires fresh target-resource plus target-version/history
> authority. D81 creates no modal,
> transferred state, duplicate product, workflow, semantic split, cross-Page
> synchronization, Vercel mutation, or money effect.

## Fact classification

- **Verified current repository facts:** `apps/admin/src/cms/collections/pages.ts`
  defines Tenant-scoped mutable Payload Pages, provider versions, and
  300-millisecond autosave. The current Web Studio edit view derives provider
  draft/public status. There is no accepted D12 Working Revision/lease, D1
  generation pin, D2 Placement Revision, D23 compiler, D79 contract, D80
  command, or D81 transaction in current runtime.
- **Verified proposed-repository facts:** proposed ADR-0156 requires one
  server-authoritative Working Revision per typed resource, separate Editorial
  and Placement axes, lease-generation fencing, expected-source CAS,
  append-only meaningful checkpoints, and restore-as-new-draft. Proposed
  ADR-0167 requires fresh independent private targets, exhaustive manifests,
  no copied authority, and one atomic/idempotent operation. Both remain proposed
  on blocked PR #1340.
- **Verified accepted Phase 24 fact:** ADR-0201 requires D80 to create a fresh
  same-Site/locale private Page without changing the source public Page,
  continuity, routes, or other owners and makes final activation depend on D81.
- **Verified external facts:** Payload's current **revert to published** keeps
  prior drafts and creates a new version matching the published state; Payload
  transactions require every awaited Local API write to share the transaction
  request; its actor-scoped Local API must explicitly disable access/lock
  override. Sanity warns that a copied draft remains and can later diverge.
  PostgreSQL provides atomic transactions, constraints, row locks, and
  serialization failure. Supabase requires grants plus RLS and notes that
  service roles bypass RLS. WCAG supports reversible/checked/confirmed stored-
  data changes and programmatic status without requiring confirmation on every
  ordinary save.
- **Repository requirement:** D1, D2, D12, D23, D79, D80, Phase 12, retention,
  and provider owners retain their boundaries. D81 may coordinate their exact
  references but cannot own or infer their facts.
- **Product judgment:** one atomic append-and-clean action is clearer and safer
  than a second active draft, a transferred state, or a per-occurrence choice.
- **Assumption requiring evidence:** representative ministry publishers can
  understand that all shown candidate changes leave the source active draft
  and can use comparison to separate a routine correction. Moderated usability
  proof is an activation gate.
- **Resolved D82/D83 questions / remaining evidence:** ADR-0203 permits only an exact
  positively proved Draft-only Path Claim to succeed atomically to a fresh
  target claim. ADR-0204 permits one fully qualified D2-owned source-descendant
  derived closure while preserving child ownership and authored inputs. Its
  incidence and capacity distribution remain evidence questions, not a reason
  to weaken the fallback to ordinary D2.

## Current repository and intended-model reconciliation

| Concern             | Current `develop`                                     | Governing proposed/accepted model                                          | Permanent D81 path                                                           |
| ------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Page/draft          | Tenant-only mutable Payload row and provider versions | ADR-0145/0156: stable Site/locale Page plus source-owned Working Revisions | No interim wrapper; append exact source successors only after full substrate |
| Autosave            | Payload autosave every 300 ms                         | D12: acknowledged revision, expected CAS, session lease generation         | Require acknowledged candidate; fence old lease on commit                    |
| Editorial/Placement | Fields in provider Page shape                         | D12/D2: separate identities, heads, leases, commands                       | Seal pair; append only changed owner-axis successors                         |
| Public baseline     | Latest published provider representation              | D1: immutable generation pins exact source revisions                       | Reset from exact D1 pins, never `latest` or compiled output                  |
| Target              | No D80 target command                                 | D80/D23: fresh private Page via finite compiler                            | Complete target and reset sealed source Page-owned heads in one transaction  |
| History             | Provider versions and log hook                        | D12 checkpoints plus durable audit/retention owners                        | Protected cause-labelled checkpoint; minimal receipt; no body duplication    |
| Access              | Broad Tenant checks; Local API can bypass             | Phase 12 exact effects; RLS defense in depth; privileged parity            | Reauthorize both scopes and leases; no browser DML or bypass                 |
| Failure             | Provider request semantics                            | Expected heads, semantic receipt, durable outbox                           | No partial effect; receipt reconciliation before retry/edit                  |
| Public/provider     | Current Pages can publish through Payload             | D1/Phase 5 are sole public authority; Vercel adapter separate              | Side-effect-dark private mutation; zero public/Vercel/money effect           |

## Current primary evidence and bounded interpretation

| Primary source                                                                                                                                                                                                                                                                  | Verified finding                                                                                                                   | D81 use                                                                                            | Rejected overreach                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [Payload Drafts](https://payloadcms.com/docs/versions/drafts)                                                                                                                                                                                                                   | **Revert to published** keeps prior drafts and creates a new version matching published                                            | Append a clean private successor while retaining candidate history                                 | Raw provider restore is not Core authorization or exact D1 pinning                 |
| [Payload Versions](https://payloadcms.com/docs/versions/overview)                                                                                                                                                                                                               | Version history supports diff/restore; ordinary `maxPerDoc` defaults to 100                                                        | Reuse qualified persistence/compare, but explicitly protect the handoff checkpoint                 | An ordinary provider version alone cannot promise durable recovery                 |
| [Payload transactions](https://payloadcms.com/docs/database/transactions)                                                                                                                                                                                                       | Awaited writes sharing `req.transactionID` are all-or-none; unawaited hooks can report false success                               | Thread every target/source/receipt write through one awaited request transaction                   | A nominal Payload transaction does not cover omitted/out-of-band writes            |
| [Payload Local API access](https://payloadcms.com/docs/local-api/access-control)                                                                                                                                                                                                | Local API access and lock overrides require explicit constraint for actor-scoped calls                                             | Use authenticated principal with `overrideAccess: false` and `overrideLock: false`                 | Server location does not itself prove authorization                                |
| [Sanity Content Releases](https://www.sanity.io/docs/studio/content-releases)                                                                                                                                                                                                   | Copying a draft elsewhere leaves the original draft; Sanity advises discarding it, and warns unpublished draft changes can be lost | Eliminate the leftover source draft in the same recoverable transaction                            | Sanity's release model and destructive discard are not Core's Page handoff         |
| [Contentful versioning](https://www.contentful.com/help/faq/versioning/)                                                                                                                                                                                                        | Version snapshots may not capture mutable linked entries and schema/locale changes affect recovery                                 | Bind exact D80 manifest/dependency revisions and keep source checkpoint independently intelligible | A generic snapshot is not a complete transfer or dependency proof                  |
| [WordPress revisions](https://wordpress.com/support/page-post-revisions/)                                                                                                                                                                                                       | Revisions/autosaves let staff compare and restore earlier content                                                                  | Use familiar compare/recovery language                                                             | WordPress identity, plugin duplicate, and silent slug rules are not Core authority |
| [Blackbaud Page copy](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/lo/content/content_pagebuilder2_pages_copying_existing_page_use_as_model.html)                                                                                                                 | Nonprofit CMS Page copies start inactive but may copy versions, attributes, and security                                           | A private target is familiar to nonprofit staff                                                    | Do not inherit security, versions, wrappers, routes, or owner facts                |
| [PostgreSQL transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html) and [isolation](https://www.postgresql.org/docs/current/transaction-iso.html)                                                                                                     | A transaction is all-or-none; serialization can abort a concurrent transaction                                                     | One short atomic boundary with whole-command retry                                                 | Do not keep a transaction open during staff review                                 |
| [PostgreSQL locking](https://www.postgresql.org/docs/current/explicit-locking.html) and [constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)                                                                                                             | Row locks prevent concurrent writes; consistent order reduces deadlocks; constraints enforce integrity                             | Expected-head/lock fences plus same-scope keys and uniqueness                                      | UI availability or a lease alone is not a database invariant                       |
| [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)                                                                                                                                                                                           | Grants and RLS both matter; update needs old/new checks; service role bypasses RLS                                                 | Least grants, `USING`/`WITH CHECK`, and privileged-path parity                                     | RLS cannot constrain a bypassing Payload/service connection                        |
| [WCAG error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html), [on input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html), and [status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) | Consequential stored-data changes need reversal/check/confirmation; context change must be forewarned; status is programmatic      | One inline review, explicit final action, protected recovery, announced status                     | WCAG does not require a second modal or typed confirmation                         |

## Strongest alternative and no-build comparison

The strongest alternative is D81 Option 2: keep the source candidate in a
clearly non-publishable transferred state until staff restore it. It maximizes
immediate visibility and avoids resetting the source editor after the action.
It also requires a new state machine, publish fence, retention rule, persistent
recovery UI, reports, tests, and eventual cleanup. It keeps two active copies
of the same intent and can strand drafts indefinitely. Exact target recovery
plus protected source history achieves its safety benefit with less product
surface and debt.

The strongest no-build answer is to block D80 and ask staff to create the Page
manually, copy permitted content, then use existing restore-to-published. That
can be safe but adds clipboard/re-entry errors, loses deterministic
identity/reference remapping and provenance, and leaves two non-atomic steps in
the exact area where Sanity documents a leftover-draft hazard. D80 already
needs the transfer compiler and transaction; adding a source checkpoint,
successor, and lease fence to the same command is proportionate.

## Full adversarial category review

### 1. Problem validity, necessity, and alternatives

**Material concern exists — High severity / High likelihood without the
decision.**

- **What could go wrong:** leaving the source candidate active creates two
  publishable copies; destructive cleanup loses mixed routine work; a new
  transferred status turns a bounded handoff into a permanent workflow.
- **Why it matters:** staff can publish the new purpose under the old Page or
  believe work vanished, undermining D79/D80's public-meaning guarantee.
- **Evidence/reasoning:** Sanity documents the leftover-draft hazard; Payload's
  revert-by-new-version preserves history; D12 already supplies one Working
  head and meaningful checkpoints.
- **Effect on answer:** narrows but does not invalidate Option 1. “Clean” must be
  append-and-advance with recovery.
- **Best prevention:** one integrated D80/D81 command; no new status or semantic
  merge.
- **Required language:** D81-R1, R2, R4, and R14 below.

### 2. Brittleness

**Material concern exists — High severity / Medium likelihood.**

- **What could go wrong:** the reset reads provider `latest`, compiled HTML, or
  mutable dependencies; schema/locale changes or linked content make the clean
  revision different from the release staff saw.
- **Why it matters:** “returns to live” becomes false and recovery may not
  reconstruct the actual candidate.
- **Evidence/reasoning:** Contentful documents snapshot/link limitations;
  current Core public reads and proposed D1 source pins are distinct facts.
- **Effect on answer:** requires exact D1 revision pins, compatible retained
  readers, and manifest dependency binding.
- **Best prevention:** source from immutable authoritative revision IDs; fail
  closed on unavailable readers or schema incompatibility.
- **Required language:** D81-R3, R5, R8, and AC10-AC14.

### 3. Technical debt

**Material concern exists — High severity / High likelihood if provider
features are exposed directly.**

- **What could go wrong:** raw duplicate/restore, a second version engine,
  bespoke cross-Page compare, transferred state, or cleanup job duplicates D12/
  D23 and ties product semantics to Payload internals.
- **Why it matters:** upgrades and every future Page owner need parallel logic.
- **Evidence/reasoning:** current Payload features are useful primitives but do
  not prove Core scope, authority, retention, or exact public pins; proposed
  ADR-0156/0167 already own the reusable boundaries.
- **Effect on answer:** removes new workflow/table/compare/Undo abstractions.
- **Best prevention:** extend the existing D80 receipt and D12 checkpoint causes;
  reuse the D23 compiler and D12 compare/restore UI.
- **Required language:** D81-R1, R6, R14, R20, and R24.

### 4. Edge cases

**Material concern exists — High severity / High likelihood across production
usage.**

- **What could go wrong:** mixed phone-number corrections, unchanged versus
  changed Placement axes, no current public release, pending browser edits,
  an exact scheduled candidate, shared owners, path collisions, long/RTL URLs,
  target deletion, or inaccessible target history produce loss or confusion.
- **Why it matters:** these are realistic ministry authoring conditions, not
  exotic failures.
- **Evidence/reasoning:** D12 separates owner axes and distinguishes
  acknowledged from browser-only work; D80 already blocks nonseparable shared
  changes and source schedules.
- **Effect on answer:** adds explicit block/compare behavior and no-op-axis rule;
  ADR-0203 settles exact private-claim adoption, while ADR-0204 later admits
  only a completely qualified D2 source-descendant derived closure and leaves
  every other descendant case blocked for ordinary D2 cleanup.
- **Best prevention:** exact pair/dependency preflight; show all affected
  outcomes; preserve checkpoint; fail closed and keep inputs.
- **Required language:** D81-R4-R8, R14-R17, AC15-AC23.

### 5. Footguns

**Material concern exists — Critical severity / Medium likelihood.**

- **What could go wrong:** a button labelled **Create** silently resets About;
  an **Undo** deletes the target; double-click creates duplicates; stale tabs
  autosave the candidate back; routine correction is silently inferred.
- **Why it matters:** staff can unintentionally lose active intent or recreate
  the material-purpose violation.
- **Evidence/reasoning:** current CMSes separate copy/discard and expose the
  leftover hazard; D12 forbids blind retry and stale writes.
- **Effect on answer:** truthful **Move** label, one explicit consequence review,
  lease fence, semantic receipt, and no semantic split/Undo.
- **Best prevention:** make the consequence visible immediately above the
  action and preserve exact recovery.
- **Required language:** D81-R10-R17 and AC24-AC31.

### 6. Tenant safety

**Material concern exists — Critical severity / Low-to-medium likelihood if
scope is convention-only.**

- **What could go wrong:** a target or checkpoint is created in another Tenant,
  Site, environment, or locale; a history link leaks the other target.
- **Why it matters:** cross-tenant content and private route leakage is a severe
  trust and privacy breach.
- **Evidence/reasoning:** current Pages are only Tenant-scoped; permanent D80
  adds Site/locale scope; Supabase RLS alone cannot constrain privileged paths.
- **Effect on answer:** exact trusted scope, composite integrity, restrictive
  deletion, non-enumerating reads, and privileged parity are mandatory.
- **Best prevention:** derive scope server-side and make cross-scope references
  structurally invalid.
- **Required language:** D81-R9, R18-R20, AC32-AC36.

### 7. Database, RLS, and authorization safety

**Material concern exists — Critical severity / Medium likelihood without
structural enforcement.**

- **What could go wrong:** `USING` permits an old head update whose resulting
  row points to another scope; service/owner paths bypass policies; caller
  supplies actor/Tenant/public pins; cascade delete erases history; duplicate
  commands win concurrently.
- **Why it matters:** application checks cannot repair a committed forbidden
  head or lost audit trail.
- **Evidence/reasoning:** Supabase requires grants plus policies and old/new
  update checks; service roles bypass RLS; PostgreSQL constraints decide races.
- **Effect on answer:** mandates composite FKs, unique semantic command/active
  head constraints, append-only grants, `USING` plus `WITH CHECK`, and server-
  derived authority.
- **Best prevention:** one owner port plus DB invariants and negative RLS tests
  for every direct and privileged route.
- **Required language:** D81-R9, R18-R21 and AC32-AC42.

### 8. Overengineering

**Material concern exists — Medium severity / High likelihood under a
preservation-first design.**

- **What could go wrong:** Core adds a transferred-draft state machine,
  per-field merge, branch model, workflow, target-sync link, background cleanup,
  or tenant configuration for a rare operation.
- **Why it matters:** the solution becomes harder than the source problem and
  creates permanent training/operation cost.
- **Evidence/reasoning:** D12 intentionally rejects multiple branches and
  automatic merge; D80 already supplies the transfer/compiler surface.
- **Effect on answer:** confirms Option 1 and explicitly excludes speculative
  abstractions.
- **Best prevention:** one command, one receipt extension, one logical handoff
  cause grouping independent per-axis pins, existing History, ordinary target
  editing.
- **Required language:** D81-R1, R6, R14, and R24.

### 9. UX/UI and user friction

**Material concern exists — High severity / High likelihood if consequences are
hidden or ceremony is added.**

- **What could go wrong:** staff misread **clean**, do not realize About's draft
  changes, lose a routine correction, face a modal/wizard, or receive success
  only in a toast; mobile/low-bandwidth users cannot recover an unknown result.
- **Why it matters:** the safest architecture fails if publishers cannot predict
  the result in one read.
- **Evidence/reasoning:** WCAG favors review/recovery for consequential stored-
  data changes and programmatic status; it does not require confirmations on
  ordinary saves. Core uses PageShell/Base UI/base-maia/Zinc and persistent
  state over transient toasts.
- **Effect on answer:** one inline two-outcome review, comparison, explicit
  mixed-change sentence, truthful CTA, persistent progress/success, no modal.
- **Best prevention:** usability test exact normal/mixed/conflict/unknown states
  at desktop and 320 CSS px with representative ministry publishers.
- **Required language:** D81-R14-R17, AC24-AC31, and AC49-AC52.

### 10. Source of truth, ownership, and domain invariants

**Material concern exists — Critical severity / High likelihood if provider
state becomes authority.**

- **What could go wrong:** D81 decides what is live, owns route history,
  rewrites D79, copies permission/schedule/shared facts, or lets its receipt
  become a synchronization source.
- **Why it matters:** dual ownership creates contradictory public and private
  truth.
- **Evidence/reasoning:** D1/D2/D12/D23/D79/D80 and Phase 12 already have named
  owners; ADR-0201 makes the receipt inert.
- **Effect on answer:** D81 only coordinates exact references and advances
  source Working heads through D12.
- **Best prevention:** state the owner matrix and invariants explicitly; public
  runtime never reads D81.
- **Required language:** D81-R2-R6, R9, R22-R24 and invariants I1-I22.

### 11. Hidden coupling

**Material concern exists — High severity / Medium likelihood.**

- **What could go wrong:** source History dereferences the target's current
  draft; target deletion breaks recovery; shared content remains live-coupled;
  the target inherits source lease or later source edits synchronize.
- **Why it matters:** two supposedly independent Pages become fragile and
  authorization-sensitive.
- **Evidence/reasoning:** Contentful versioning illustrates linked-dependency
  recovery limits; D80 requires fresh identities/materialization and inert
  provenance.
- **Effect on answer:** source checkpoint is independently sufficient; target
  link pins the initial target revision and is access-aware; no live sync.
- **Best prevention:** receipt references only immutable IDs/digests with
  restrictive deletion/tombstones and no runtime dereference.
- **Required language:** D81-R5-R8, R13, R23 and AC18-AC23.

### 12. Failure modes

**Material concern exists — Critical severity / Medium likelihood.**

- **What could go wrong:** target creates but source stays dirty; source cleans
  but target fails; audit commits alone; response is lost; an async hook returns
  success before rollback; post-commit navigation fails.
- **Why it matters:** partial or ambiguous success produces lost work,
  duplicates, and manual database repair.
- **Evidence/reasoning:** Payload warns unawaited transaction hooks can yield an
  incorrect success response; database/network failures are normal.
- **Effect on answer:** all authoritative writes are awaited in one transaction;
  unknown response reconciles receipt; navigation is post-commit presentation.
- **Best prevention:** failpoint every write boundary and reconcile committed
  result independent of client navigation.
- **Required language:** D81-R10-R13, R21, AC37-AC48.

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern exists — Critical severity / High likelihood under multiple
tabs/autosave.**

- **What could go wrong:** a save or publish wins after review; old lease
  generation resurrects candidate; same command appends twice; a changed public
  baseline is used; scheduled work fires; deadlock retry changes inputs.
- **Why it matters:** two individually valid actions can jointly violate the
  one-clean-source invariant.
- **Evidence/reasoning:** D12 requires lease generation plus CAS; PostgreSQL may
  abort serialization/deadlock conflicts; current UI autosaves frequently.
- **Effect on answer:** seal working/public/lease/schedule heads, deterministic
  lock order, exact-command replay only, and fence leases in commit.
- **Best prevention:** one semantic command identity bound to all inputs and a
  whole-transaction retry/reconciliation policy.
- **Required language:** D81-R7, R10-R13, R21 and AC37-AC48.

### 14. Data integrity risks

**Material concern exists — Critical severity / Medium likelihood.**

- **What could go wrong:** target meaning is incomplete, fresh IDs are not
  remapped, source head points to a target revision, checkpoint is pruned, an
  unchanged axis accumulates no-op versions, or audit lacks exact cause.
- **Why it matters:** recovery and later publication become unreliable.
- **Evidence/reasoning:** D23's exhaustive manifest and D12's typed resources
  exist precisely to prevent generic document copying and fused heads.
- **Effect on answer:** conservation proof, same-resource FKs, protected cause,
  no-op suppression, and exact receipt fields are mandatory.
- **Best prevention:** structural constraints plus manifest property tests and
  rollback/replay tests.
- **Required language:** D81-R3-R8, R11, R19-R20, AC1-AC23.

### 15. Security and privacy risks

**Material concern exists — High severity / Medium likelihood.**

- **What could go wrong:** history discloses private target route/title;
  checkpoint bodies remain forever; actor IDs or sensitive ministry content
  enter logs/receipt; service path bypasses authorization.
- **Why it matters:** draft content may include sensitive missionary or ministry
  information and cross-tenant disclosure is unacceptable.
- **Evidence/reasoning:** Supabase notes service-role bypass; D12 makes version
  reads resource-authorized; data minimization conflicts with immortal copies.
- **Effect on answer:** minimal receipt, bounded governed retention, fresh
  independent reads, non-enumerating unavailable result, and privileged parity.
- **Best prevention:** keep content only in authoritative version storage;
  redact logs; audit access; test target purge/access-loss behavior.
- **Required language:** D81-R8-R9, R18-R20, R23, AC32-AC36.

### 16. Scalability and performance risks

**Material concern exists — Medium severity / Medium likelihood.**

- **What could go wrong:** large Page manifests, many references, checkpoints,
  and multiple writes hold locks too long; unbounded history or N+1 validation
  degrades larger Tenants; transaction retries amplify load.
- **Why it matters:** a safety action that times out encourages retries and
  increases contention.
- **Evidence/reasoning:** Payload versions store full documents; Sanity
  publishes explicit release size limits; D33 already governs production-shaped
  capacity instead of guesses.
- **Effect on answer:** no arbitrary new product limit is frozen; D33 profiles
  exact D81 operations across cohorts with set-based preflight and bounded
  transaction work.
- **Best prevention:** compile/validate outside the transaction, recheck only
  sealed heads inside, use equality-leading indexes, no network calls, monitor
  profile thresholds.
- **Required language:** D81-R10, R19-R21, R25, AC45-AC48.

### 17. Operational burden

**Material concern exists — Medium severity / High likelihood if recovery is
manual.**

- **What could go wrong:** partial results require SQL repair; retained drafts
  need cleanup; operators must correlate logs across target/source/provider;
  version pruning silently breaks support recovery.
- **Why it matters:** ministries and platform operators should not need tribal
  knowledge for a normal authoring correction.
- **Evidence/reasoning:** Option 2's lifecycle and a two-step provider workflow
  create exactly this burden.
- **Effect on answer:** atomic command, receipt lookup, durable audit, protected
  checkpoint, no cleanup queue, and runbooked monitors.
- **Best prevention:** self-diagnosing cause states and replay/receipt tooling;
  never direct DB repair as ordinary recovery.
- **Required language:** D81-R8, R10-R13, R21, R25 and monitor section.

### 18. Observability and auditability gaps

**Material concern exists — High severity / High likelihood with current log-
only hooks.**

- **What could go wrong:** support cannot prove whether the command committed,
  what public revision supplied the clean source, why an axis changed, or who
  accessed the target link.
- **Why it matters:** technical logs are not durable business history and do
  not support safe correction.
- **Evidence/reasoning:** current `afterChange` audit is log-oriented; D12/D80
  require meaningful checkpoints, receipts, and audit/outbox.
- **Effect on answer:** defines exact cause/receipt/audit fields and named
  monitors while excluding content from logs.
- **Best prevention:** durable business receipt/checkpoint plus correlated,
  redacted technical traces and access audit.
- **Required language:** D81-R8, R11, R13, R21, R25.

### 19. Dependency and integration risks

**Material concern exists — High severity / Medium likelihood.**

- **What could go wrong:** Payload build semantics, transaction options,
  version pruning, Local API overrides, async hooks, or schema changes weaken
  atomicity/recovery; Vercel or Stripe work is accidentally coupled.
- **Why it matters:** provider upgrades could silently change a safety boundary.
- **Evidence/reasoning:** Payload documents transaction opt-out, unawaited-hook
  hazards, access overrides, and version limits; Supabase privileged paths
  bypass RLS.
- **Effect on answer:** exact-build adapter qualification, no provider-native
  product command, no external call, and D33 attachment proof are mandatory.
- **Best prevention:** provider conformance tests on every upgrade and fail-
  closed capability activation.
- **Required language:** D81-R20-R25, AC41-AC48.

### 20. Migration, rollout, and upgrade risks

**Material concern exists — High severity / Medium likelihood.**

- **What could go wrong:** old writers ignore lease fences; new code reads old
  mutable Pages; mixed schema omits receipt/checkpoint fields; rollback deletes
  target or reactivates candidate; retained revisions become unreadable.
- **Why it matters:** the first rollout can violate the permanent invariant even
  if steady-state code is correct.
- **Evidence/reasoning:** current runtime lacks every required identity/head;
  ADR-0201 prohibits an interim wrapper.
- **Effect on answer:** additive expansion, retained versioned readers, shadow
  no-write preflight, cohort enablement, writer fences, roll-forward repair, and
  non-destructive rollback.
- **Best prevention:** prove old/new compatibility matrices and migration
  failpoints before enabling any handoff.
- **Required language:** D81-R25 and AC55-AC56.

### 21. Testability, traceability, and proof

**Material concern exists — Critical severity / High likelihood if specified
only as “atomic.”**

- **What could go wrong:** tests assert provider calls instead of the one target,
  clean source, retained candidate, fenced lease, zero public effect, and exact
  replay; ADR/OpenSpec/tickets use contradictory terms or omit D81 from D33.
- **Why it matters:** plausible implementation can pass unit tests while losing
  work or exposing cross-tenant data.
- **Evidence/reasoning:** D80 already requires D33 exact workload cells and
  cross-artifact traceability; D81 adds a source-side mutation and new races.
- **Effect on answer:** adds falsifiable requirements, invariants, ACs, negative
  authorization/race/failpoint/accessibility/capacity suites, and traceability.
- **Best prevention:** public-seam and domain-outcome tests tied from answer to
  release evidence; reject implementation-detail-only proof.
- **Required language:** all D81 requirements and ACs; especially R25.

### 22. Other development hazards

**Material concern exists — High severity / Medium likelihood.**

- **What could go wrong:** “all changes move” is false when a staged path or
  separately owned fact is excluded; a dependent descendant path closure is
  silently transferred or partially changed; success navigates away before
  durable confirmation.
- **Why it matters:** inaccurate copy and unresolved D2 ownership cause staff
  surprise or unnecessary rework.
- **Evidence/reasoning:** D80 forbids copying source Placement; ADR-0203 permits
  only one exact Draft-only Path Claim succession, while ADR-0146 makes ancestor
  changes affect descendant derived paths.
- **Effect on answer:** UI says **saved Page changes** and lists affected owner
  outcomes; excluded owners block or remain explicit. ADR-0204/D83 admits only
  the complete deterministic D2 source closure and never transfers children.
- **Best prevention:** exhaustive owner/closure manifest, ordinary D2 fallback,
  and navigation only from a reconciled receipt.
- **Required language:** D81-R4-R7, R14-R17, R24-R25, ADR-0203/D82, and
  ADR-0204/D83.

## Required specification language

### D81-R1 — One integrated disposition

After D79 **changes what this Page is for**, D80 SHALL expose one **Move saved
changes to new Page draft** completion. D81 is not a standalone duplicate,
restore, workflow, status, permission, or background task.

### D81-R2 — Append-only clean source

Cleaning SHALL append private successors from the exact D1-pinned authoritative
source revisions and advance private Working heads. It SHALL never delete,
overwrite, relabel, destructively restore, publish, unpublish, or reconstruct
from compiled/provider-latest/browser state.

### D81-R3 — Exact public baseline

Preflight and commit SHALL bind one current immutable D1 public generation and
its exact source-owned Editorial/Placement revision pins. A missing, changed,
unreadable, or incompatible public baseline makes D81 unavailable.

### D81-R4 — Separate-axis precision

Editorial and Placement remain separate D12 resources. D81 SHALL checkpoint the
exact reviewed candidate pair, append a successor only for an axis whose
Working head differs from the corresponding public pin, and emit no no-op
revision for an unchanged axis.

### D81-R5 — Transfer conservation

The target SHALL be D80's fresh-identity deterministic transfer result. Every
manifest-admitted saved Page-owned meaning SHALL copy, materialize/remap,
require disclosed repair, or block; nothing silently disappears. Byte identity
and copied authority are forbidden.

### D81-R6 — Other owners unchanged

Navigation, shared/global owners, Reusable Section authority, schedules,
comments, workflow, D78/D79, public generations, routes, search/cache,
analytics, providers, and money SHALL not reset or transfer implicitly.
ADR-0203/D82 is one explicit D2-owned private-claim succession, not an implicit
route copy: it requires exact current source ownership and complete positive
route-effect proof, preserves source Placement History, and appends a fresh
target claim in D81's transaction.

### D81-R7 — Acknowledged and schedulable input only

Browser-only, queued, in-flight, outcome-unknown, or stale edits SHALL block.
The exact affected candidate SHALL have no unresolved publish appointment;
existing owner actions resolve it before D81.

### D81-R8 — Protected meaningful checkpoint

Commit SHALL append one logical handoff event/cause **Moved saved changes to a
new Page draft** grouping independently resource-scoped Editorial and Placement
checkpoint pins; it SHALL NOT create one fused cross-axis D12 content resource.
The event binds exact candidate/public/target/manifest/actor/receipt references.
It protects authoritative content from ordinary pruning under
governing bounded recovery/retention rules; the receipt SHALL not duplicate the
body. Before implementation tickets, D12's versioned semantic-retention profile
SHALL register `material_page_handoff` with protection starting at commit, an
explicit owner-authorized release/prune predicate, D12 recovery/D1/legal-hold/
privacy precedence, audited tombstone/receipt behavior, and tests. D81 SHALL
invent neither a day count nor a Tenant retention setting.

### D81-R9 — Existing authority only

Commit SHALL rederive scope/actor and recheck existing source read/edit/release,
target create/edit/placement, D12 lease/head, and applicable history effects.
It specifically SHALL require D79's exact source release-decision effect,
source Editorial read/edit, and source Placement edit/supersede when Placement
differs; target Placement authority is insufficient for the source. D81 SHALL
add no role, assignment, approval, invite, or bypass.

### D81-R10 — Sealed expected-head preflight

The plan SHALL bind trusted scope, exact candidate/dependencies, public pins,
D79/D80 heads, leases, schedules, manifest/adapter/policy generations, target
inputs/route claim/repairs, actor effect epoch, and semantic command identity.
When D82 applies, it also binds the source claim/version, canonical key,
complete route-evidence version, target parent chain, Site-locale public base,
and canonicalizer/reservation/route-policy generations. Commit repeats every
mutable proof.

### D81-R11 — Atomic command

One short transaction SHALL create target/transfer artifacts, checkpoint source,
append necessary clean successors, advance source heads, fence every lease in
the sealed source Editorial/Placement pair, and append receipt/audit/outbox—or
perform none. ADR-0203's exact source-claim supersession and fresh target
claimant-ownership occurrence/version participate in that same transaction
when eligible.

### D81-R12 — Semantic idempotency

Same-key/same-input replay SHALL return the one authorized result with no new
effect. Same-key/different-input SHALL conflict. A uniqueness fence SHALL
prevent more than one successful result for one exact source candidate and
semantic command.

### D81-R13 — Unknown outcome reconciliation

Lost acknowledgement SHALL freeze successor source writes and reconcile the
receipt before retry or further editing. It SHALL not show a blind retry or
claim failure from transport evidence alone.

### D81-R14 — One inline consequence review

D81 SHALL remain in D80's PageShell review with two stacked outcome rows, exact
tenant-branded URLs/context, one comparison, one primary action, and **Back to
editing**. It SHALL add no modal, wizard, checkbox, typed confirmation, or
timed-toast-only result. D82 reuses the Parent Page/Web address group with one
visible **From `<source>`'s saved draft** helper and adds no adoption control.

### D81-R15 — Honest mixed-change language

The review SHALL state that the new Page receives safely transferable saved
Page content and the explicitly selected new-Page details; any repairable
omission is listed and remains in exact protected source History. Those moved
Page-owned changes leave the source draft, separately managed content stays
unchanged, and staff must go back and separate any change that still belongs on
the source. Core SHALL NOT infer or merge fields.

### D81-R16 — Complete persistent states

Save-required, checking, ready, repair, blocker, schedule, collision, drift,
permission, moving, uncertain, failure, and success states SHALL be persistent,
cause-owned, input-preserving, and programmatically announced. Unknown results
reconcile before interaction resumes.

### D81-R17 — Post-success editor behavior

After commit, Core SHALL recheck exact target read/edit authority and acquire an
ordinary fresh target lease. On success it SHALL open the receipt-bound target,
focus its heading, show **Draft - not live** and the persistent moved/nothing-
published result, and offer permission-safe **Open About** and **View source
history**. If the fresh check fails, it SHALL show a non-enumerating committed
confirmation without target detail or navigation. There is no destructive Undo.

### D81-R18 — Same-scope structural integrity

Composite foreign keys, non-null owner pins, restrictive deletes, unique active
head/lease/route/semantic-command constraints, and equality-leading indexes
SHALL make cross-scope or duplicate effects invalid.

### D81-R19 — Grants and RLS

Browser/Data API roles SHALL have no direct D81 mutation grant. Exposed reads
use least grants and FORCE/ENABLE RLS as applicable; mutations use correct
`USING` and `WITH CHECK`; append-only facts expose no general update/delete.

### D81-R20 — Privileged and Payload parity

RPC, view, function, owner, service, worker, Payload, import, migration,
support, and repair paths SHALL repeat scope/authorization/head/lease proof.
Qualified Payload calls SHALL share the transaction and use actor-bound
`overrideAccess: false`, `overrideLock: false`, `fallbackLocale: false`,
explicit draft intent, and depth-zero reads.

### D81-R21 — Concurrency and lock discipline

The server SHALL use lease generation plus CAS, deterministic lock order, short
transactions, database-decided uniqueness, and whole-command retry only for
the exact input. Commit SHALL require current pair leases to be unowned or held
by the initiating authorized session and SHALL fence every current lease
generation in the sealed source Editorial/Placement pair, even when an
unchanged axis receives no successor.

### D81-R22 — Zero public and money effect

Source public content/routes/continuity/Navigation/search/cache/schedule/donor
result and target-public state SHALL remain unchanged. D81/D82 SHALL create no
Vercel, DNS/TLS, redirect, deployment, Stripe, currency, gift, ledger,
designation, recurring schedule, receipt, form, email, or donor-account fact.

### D81-R23 — Independent access-aware history

Source recovery SHALL not depend on target survival. Source Editorial-history,
source Placement-history, target-resource, and target-version/history reads
SHALL authorize independently; current-target read alone cannot open the
initial historical target revision. A grouped source comparison renders only
authorized axes or one generic unavailable result, and unavailable target
detail is non-enumerating. Retention/privacy/legal-hold owners remain
authoritative.

### D81-R24 — Explicit non-goals

D81 SHALL add no transferred state, generic duplicate, provider restore, second
version engine, semantic diff classifier, field/block merge, multiple branch,
cross-Page sync/compare subsystem, new workflow, cleanup timer, notification,
route reservation service, generic claim-transfer API, queue/saga, or owner
adapter beyond existing D2/D12/D23/D80 ports.

### D81-R25 — Rollout, capacity, and traceability

Activation SHALL require the full predecessor substrate, additive migration and
mixed-version fences, failpoint/replay/RLS/accessibility/retention proof, D33
Min/Typical/Measured-max scenario and exact Vercel Qualification Attachment,
named monitors/runbooks, and traceability from D81 through glossary, ADR,
OpenSpec, design, tasks, tickets, implementation, tests, and release evidence.

## Domain invariants

1. **I1:** A successful D81 command creates exactly one target Page and exactly one
   semantic receipt.
2. **I2:** The target is private and not serving after D81.
3. **I3:** The source public generation and every public/route/continuity owner fact are
   unchanged.
4. **I4:** One logical source handoff event groups independently resource-scoped
   checkpoint pins for the exact pre-handoff candidate pair.
5. **I5:** The exact untransformed candidate remains recoverable under governing
   retention policy.
6. **I6:** The target contains every safely transferred meaning under the sealed
   manifest with fresh local identities; every repairable omission is explicit
   and remains recoverable in the exact source checkpoint.
7. **I7:** Unknown or incompatible transfer members fail closed.
8. **I8:** Each changed source-owned axis gets exactly one clean successor; an unchanged
   axis gets none.
9. **I9:** Every resulting source Working head belongs to the exact source resource and
   resolves to the corresponding revision pinned by the sealed public
   generation.
10. **I10:** No target revision may become a source Working head.
11. **I11:** No lease generation for the sealed source Editorial/Placement pair
    that was valid before commit can mutate either source axis after commit.
12. **I12:** Target editing obtains a fresh target lease; no source lease transfers.
13. **I13:** Failure before commit leaves source candidate/head/lease intact and creates
    no target/checkpoint/receipt.
14. **I14:** Exact replay adds no target, checkpoint, successor, audit effect, or lease
    change.
15. **I15:** Changed-input replay under one key creates nothing.
16. **I16:** Source history remains intelligible when target is unreadable or gone.
17. **I17:** Receipt/provenance is inert and never a synchronization or public-read
    authority.
18. **I18:** Caller-controlled Tenant/Site/Page/actor/head/lease/public pins never become
    trusted facts.
19. **I19:** Cross-Tenant/environment/Site/locale/resource references are structurally
    invalid.
20. **I20:** No network/provider/money action participates in the transaction.
21. **I21:** No browser-only unacknowledged content is claimed as moved or recovered.
22. **I22:** No restoration or later target lifecycle action silently publishes,
    unpublishes, deletes, or rewrites the other Page.

## Lifecycle and valid transitions

| State                                 | Valid next action                                             | Invalid transition/result                          |
| ------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------- |
| Candidate not acknowledged            | Save/resolve D12 state                                        | Move browser buffer                                |
| Acknowledged but preflight incomplete | Resolve blocker or Back to editing                            | Mutate on option selection                         |
| Ready sealed plan                     | Submit exact semantic command                                 | Trust UI availability as reservation               |
| Commit in progress                    | Await/reconcile one receipt                                   | Edit source, submit different payload, blind retry |
| Commit conflict/failure               | Preserve source and inputs; re-review                         | Partial target or source clean                     |
| Outcome unknown                       | Receipt lookup, then committed result or safe retry           | Label failed from missing response                 |
| Committed                             | Source clean, lease fenced, target private, history protected | Old source autosave accepted                       |
| Target later edited/published/trashed | Ordinary target owner actions                                 | Change source history/public state                 |
| Source later restored                 | Per-axis D12 restore; D2 revalidates Placement/path           | Reclaim/delete/synchronize target or its path      |
| Retention/privacy action              | Governing hold/dependency proof and audit                     | Ordinary provider pruning of protected recovery    |

## Logical data and authority shape

D81 SHALL extend the existing D80 semantic receipt rather than introduce a
parallel workflow table. At minimum the logical result binds:

- trusted Tenant, environment, Site, locale, actor/effect epoch, cause, and
  semantic command identity;
- source Page, candidate Editorial/Placement Working revision IDs and digests,
  D79/D80 plan, dependency digest, and pre-commit lease generations;
- exact D1 public generation and source-owned Editorial/Placement pins;
- protected logical handoff-event/per-axis checkpoint-pin references and every
  appended source clean successor;
- target Page and receipt-bound initial target Editorial/Placement revisions;
- manifest/adapter/policy versions, normalized route claim, repairs, result
  time, and durable audit/outbox correlation; and
- post-commit source Working heads and fenced lease generations.

The receipt stores no Page body. Content remains in the authoritative source
and target revision stores. Head pointers use same-resource composite foreign
keys. Deletion is restrictive/tombstoned so neither target purge nor source
retention cascades into the other's authority. One equality-led uniqueness
constraint covers the scoped semantic command; one target route constraint is
owned by D2. Physical names remain a design/migration decision and SHALL not be
invented in the product spec.

## Staff UX specification

### Main review

The D80 inline continuation remains one calm main-column panel. It shows fixed
current Site/domain/locale context and the editable target title, parent, and
web address already decided by D80. Immediately before the final action:

> **New Page · Private draft**  
> Short-term team application  
> `https://hoperelief.org/serve/short-term-teams`
>
> **About · Stays live; these Page changes leave its draft**  
> `https://hoperelief.org/about`
>
> The safely transferable saved Page content and the new Page details shown
> above will become the private draft. Anything that cannot transfer safely is
> listed under Review after moving and remains in the exact protected source
> History. Nothing will be published. About stays live; these moved Page-owned
> changes are no longer active there. Separately managed content stays
> unchanged.
>
> If any of these changes still belong on About, go back and separate them
> before moving.

Actions:

- **Compare saved draft with live About**
- **Move saved changes to new Page draft** (primary)
- **Back to editing** (secondary)

No text calls the action delete, discard, duplicate, clone, restore, revert,
rollback, deploy, or migrate. No detail depends on an Inspector that disappears
on narrow screens.

### Exact visible states

| State                | Required persistent copy/action                                                                                                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Local/in-flight work | **Save these changes first** / **Save now**                                                                                                                                                          |
| Preflight            | **Checking the new Page and About...**                                                                                                                                                               |
| Ready                | **Ready to move · Nothing will be published**                                                                                                                                                        |
| Review repairs       | **Review after moving** with exact target repair summary                                                                                                                                             |
| Blocker              | Cause and owner-native repair; **Back to editing**                                                                                                                                                   |
| Source schedule      | Exact existing cancel/return action; no implicit cancellation                                                                                                                                        |
| Drift                | **About changed since this review. Review the latest saved version. Nothing was moved.**                                                                                                             |
| Moving               | **Creating the new Page and removing these Page changes from About's active draft...**                                                                                                               |
| Unknown              | **Checking whether the changes were moved...**; no retry/edit                                                                                                                                        |
| Failure              | Cause, inputs preserved, source unchanged, focus to summary/field                                                                                                                                    |
| Success              | **Saved changes moved from About. About stays live; these moved Page changes are no longer active there. Separately managed content was not changed. Nothing was published.**                        |
| Stale source tab     | Read-only **These changes were moved to a new Page draft. Refresh to see About's current draft.**                                                                                                    |
| Target inaccessible  | **Saved changes moved. The source Page stays live and these moved Page changes are no longer active there. Nothing was published. You no longer have access to the new Page.** No target detail/link |

### Donor and public experience

There is none. Donors continue to receive the same tenant-native About Page at
the same URLs. The target has no public route, index, interstitial, redirect,
platform branding, or donor-visible status. D81 does not add a network hop.

## Acceptance criteria

1. **AC1:** A ready D79/D80 plan exposes exactly one D81 primary action with the required
   label.
2. **AC2:** Success creates exactly one fresh private target Page and one D80/D81
   receipt.
3. **AC3:** The target uses the sealed D80 compiler and fresh Page-local identities.
4. **AC4:** Every admitted source member is copied/materialized, explicitly
   omitted with a named repair, or blocked; property tests prove no silent
   manifest member.
5. **AC5:** The exact untransformed source candidate pair receives one named
   logical handoff event grouping independently resource-scoped protected
   checkpoint pins.
6. **AC6:** The handoff cause, per-axis pins, actor, time, public pins, target
   initial revisions, manifest version, and receipt are durable and queryable
   only with their exact authority.
7. **AC7:** The receipt contains no Page body or sensitive rendered content.
8. **AC8:** A changed Editorial axis receives one clean private successor from its exact
   public Editorial pin.
9. **AC9:** A changed Placement axis receives one clean private successor from its exact
   public Placement pin.
10. **AC10:** An unchanged axis receives no successor or misleading history event.
11. **AC11:** A source without a current exact D1 public generation fails closed.
12. **AC12:** Public-pin drift after preflight creates nothing and preserves source.
13. **AC13:** An unavailable retained reader/schema conversion creates nothing and
    preserves source.
14. **AC14:** Clean successors are produced from authoritative revisions, never public
    HTML, cache, provider `latest`, or browser state.
15. **AC15:** Browser-only or in-flight edits keep the primary unavailable and are never
    claimed as moved.
16. **AC16:** A scheduled affected candidate must use the existing owner cancellation
    before D81; unrelated appointments remain unchanged.
17. **AC17:** Nonseparable shared/global changes remain D80 blockers and are never reset.
18. **AC18:** A mixed routine correction appears in target/history; Core does not split
    it, and the review tells staff to go back if it belongs on source.
19. **AC19:** Target later deletion or access loss cannot remove or corrupt source
    recovery.
20. **AC20:** Source History comparison pins pre-handoff candidate and clean successor,
    never target current draft, and authorizes Editorial and Placement axes
    independently.
21. **AC21:** Target link pins the initial target revision and checks fresh exact
    target-resource plus target-version/history read authority; current-target
    read alone is insufficient.
22. **AC22:** Unauthorized/unavailable target detail returns a generic result without
    title/path/Site/locale/lifecycle leakage.
23. **AC23:** The versioned `material_page_handoff` retention class records
    protection start and release/prune evidence; D12 recovery/D1/legal-hold/
    privacy precedence and tombstone/receipt outcomes are tested separately from
    ordinary provider pruning, which cannot release protection.
24. **AC24:** The review shows both target and source outcomes immediately above the CTA.
25. **AC25:** The CTA says **Move saved changes to new Page draft**, never generic
    **Create**, **Copy**, or destructive **Discard**.
26. **AC26:** The review includes the exact mixed-change sentence and comparison action.
27. **AC27:** Selecting any radio/input causes no mutation, navigation, or focus change.
28. **AC28:** Progress, unknown, error, stale-tab, and success messages are persistent and
    programmatically announced.
29. **AC29:** Success opens and focuses the target only after a committed/
    reconciled receipt, fresh target read/edit authorization, and fresh target
    lease; failure shows a detail-free committed confirmation instead.
30. **AC30:** Success shows exact Site/domain/locale, **Draft - not live**, source result,
    **Open About**, and authorized **View source history**.
31. **AC31:** No modal, typed confirmation, workflow, destructive Undo, or timed-toast-
    only essential result exists.
32. **AC32:** Cross-Tenant, environment, Site, locale, Page, or resource references fail
    at command and database boundaries.
33. **AC33:** Actor, scope, public pins, leases, and audit attribution are server-derived.
34. **AC34:** Permission revocation between review and commit changes nothing.
35. **AC35:** Source Editorial-history, source Placement-history, target-resource,
    and target-version/history permissions imply none of one another.
36. **AC36:** Anonymous and unrelated Tenant users cannot enumerate plans, receipts,
    checkpoints, target links, heads, or leases.
37. **AC37:** Every write failpoint before commit rolls back target, checkpoint,
    successors, heads, lease fence, receipt, audit, and outbox.
38. **AC38:** No failpoint can clean source while leaving no target or create target while
    leaving source dirty.
39. **AC39:** Concurrent source save, publish, takeover, public-head change, route claim,
    or capability change yields one winner and no partial effect.
40. **AC40:** Deterministic lock order and deadlock/serialization retry replay the exact
    semantic command only.
41. **AC41:** Same-key/same-input replay returns one result and adds zero new rows/effects.
42. **AC42:** Same-key/different-input replay conflicts and changes nothing.
43. **AC43:** A committed-with-lost-acknowledgement result is found by receipt before any
    retry or source edit.
44. **AC44:** No pre-commit lease generation in the sealed source Editorial/
    Placement pair can save after commit; stale composite source tabs become
    read-only.
45. **AC45:** The target obtains a fresh ordinary lease; source lease identity is absent.
46. **AC46:** Every qualified Payload call is awaited, shares the transaction request,
    and uses the required access/lock/locale/depth settings.
47. **AC47:** An unawaited hook, disabled transaction, raw restore/duplicate, or provider
    latest read fails conformance and keeps D81 disabled.
48. **AC48:** The transaction performs no network/Vercel/Stripe/search/cache/render/media/
    notification/integration call.
49. **AC49:** Keyboard, screen reader, visible focus, forced colors, reduced motion, and
    status-message tests pass.
50. **AC50:** One DOM/reading order reflows at 320 CSS px and 400 percent without lost
    action, URL, comparison, error, or success information.
51. **AC51:** Long translated/CJK/RTL copy and bidi-isolated URLs remain understandable
    and operable; touch targets are at least 44 CSS pixels.
52. **AC52:** Weak-network/reconnect tests recover checking/unknown/committed results
    without duplicate target or lost form input.
53. **AC53:** D33 proves set-based preflight and transaction latency/lock/history volume
    across Min, Typical, and Measured-max cohorts against the active profile.
54. **AC54:** The exact Vercel Qualification Attachment records D81 as a zero-Vercel-
    operation scenario and proves no hidden platform request.
55. **AC55:** Migration tests prove old writers cannot publish or autosave through stale
    D79/D12 heads and mixed versions fail closed.
56. **AC56:** Rollback disables new D81 commands without deleting committed target,
    history, receipt, or clean source state.
57. **AC57:** Public route/canonical/body/Navigation/search/cache/schedule/donor snapshots
    are identical before and after D81.
58. **AC58:** No Stripe/currency/gift/ledger/receipt/email/form/donor-account write occurs.
59. **AC59:** Glossary, ADRs, OpenSpec, design, tasks, tickets, implementation, tests, D33
    evidence, and release notes use the same action, state, owner, and invariant
    terms.
60. **AC60:** ADR-0203's exact Draft-only Path Claim succeeds only through one
    atomic source supersession plus fresh target ownership occurrence/version
    with complete route-
    effect proof and receipt-first replay; every public/protected/unknown or
    incompatible descendant claim stays unavailable. ADR-0204's exact
    qualified derived closure is the sole descendant exception and preserves
    every direct child Placement input and owner fact.

## Required proof suite

- **Domain/property:** manifest conservation, fresh identities, exact checkpoint
  pairing, changed/no-op axis behavior, public-pin equality, inert provenance,
  and no copied authority.
- **Database:** same-scope FKs, active-head/lease/route/idempotency uniqueness,
  restrictive delete/tombstone, null/check constraints, index plans, and every
  write failpoint.
- **RLS/authorization:** allow/deny for anon, authenticated non-member, wrong
  Tenant/Site/locale/resource, source-only, target-only, revoked actor, history-
  only, and privileged Payload/service/RPC/view/import/migration/support paths;
  assert old-row `USING` and resulting-row `WITH CHECK`.
- **Concurrency/idempotency:** two tabs, same-user/different-user, save versus
  handoff, publish versus handoff, lease takeover, public-head drift, route
  claimant, double click, same/different key payload, deadlock/serialization,
  lost request, lost response, and stale browser back-cache.
- **Failure/recovery:** fail before/after every target/source/checkpoint/head/
  lease/receipt/audit/outbox write; target access loss/purge; source retention;
  retained-reader/schema failure; unknown-result reconciliation; ordinary
  per-axis Restore as a new draft after handoff, including a target-owned path
  collision that requires a new D2 source placement.
- **Migration/upgrade:** additive schema, old-code/new-schema and new-code/old-
  schema denial, old-writer fences, retained manifest/revision readers, provider
  version upgrade conformance, kill switch, rollback, and roll-forward repair.
- **UX/accessibility:** normal, mixed-correction, blocker, drift, permission,
  moving, unknown, failure, success, stale tab, target-unavailable, desktop,
  320-CSS-pixel/400-percent, keyboard, screen reader, forced colors, reduced
  motion, 44-pixel touch, long/CJK/RTL, and weak-network scenarios.
- **Public/non-effects:** compare source D1/Phase-5 route/body/canonical/D78/D79/
  Navigation/search/cache/schedule/donor projections and assert no Vercel or
  money/provider request.
- **Capacity/operations:** D33 exact scenario at all cohorts, N/N+1 queries,
  lock duration, transaction retries, history growth, receipt lookup, audit/
  outbox volume, and alert/runbook exercise.

## Named monitors and required responses

| Signal                                                                           | Threshold                                                                                                                                     | Owner                                      | Required response                                                                                                                         |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Partial D81 invariant violation (target/source/checkpoint/head mismatch)         | Any event                                                                                                                                     | Web Studio domain owner + database on-call | Disable D81 globally, preserve evidence, stop repair automation, reconcile from receipts, release only after root-cause proof             |
| Duplicate successful target/checkpoint/successor for one semantic command        | Any event                                                                                                                                     | Database owner                             | Disable cohort, quarantine duplicates without deletion, run idempotency/constraint audit                                                  |
| Post-commit write accepted with pre-commit source lease generation               | Any event                                                                                                                                     | D12/editor owner                           | Disable D81 and affected writer, fence leases, inspect all handoffs since last known-good deploy                                          |
| Protected handoff pin pruned before the versioned D12 profile authorizes release | Any event                                                                                                                                     | D12 history + privacy owner                | Halt pruning, restore from backup if authorized, audit retention profile/adapter, notify affected Tenant through existing incident policy |
| Unknown outcome unresolved                                                       | Longer than the active D33 receipt-reconciliation SLO or five consecutive lookup failures, whichever occurs first                             | Web Studio operations                      | Keep editor frozen, surface cause-owned recovery, page owner, do not advise blind retry                                                   |
| Authorization/non-enumeration denial failure                                     | Any unauthorized disclosure or cross-scope allow                                                                                              | Security owner                             | Disable D81/history links, invoke incident response, rotate/repair policy as applicable, rerun full RLS/privileged suite                  |
| D81 transaction latency/lock/retry rate                                          | Exceeds the active Production Capacity Profile threshold for two consecutive evaluation windows                                               | Database/platform owner                    | Pause cohort expansion, inspect query plan/lock order, tune only from measured evidence                                                   |
| Staff mixed-change recovery friction                                             | More than 5% of at least 20 observed handoffs are abandoned after the consequence review or require support to recover an old-Page correction | Web Studio product/UX owner                | Review recordings/support causes, improve copy/comparison within D81 boundary; do not add semantic merge without a new decision           |
| Hidden Vercel/provider/money call                                                | Any call correlated with D81 command                                                                                                          | Owning integration + Web Studio owner      | Disable D81, remove coupling, reconcile external state, repeat zero-effect qualification                                                  |

## Ruthless synthesis — strongest path forward

### Resolved before recording D81

1. Accept Option 1 only as **append-and-advance**, never delete/restore.
2. Make the target the D80 compiler result and source history the exact original
   candidate; stop calling the target byte-identical.
3. Keep Editorial/Placement distinct, suppress no-op successors, and never reset
   separate owners.
4. Put target creation, the logical handoff event and per-axis checkpoint pins,
   clean successors, head changes, sealed-pair lease fence, receipt/audit/outbox
   in one transaction.
5. Use one inline two-outcome review and truthful **Move** action with explicit
   mixed-change recovery language.
6. Protect recovery from ordinary pruning while preserving retention/privacy
   authority.

### Required in consolidated spec/design before implementation

1. Map D81-R1-R25 and invariants I1-I22 into the Phase 24 OpenSpec, design,
   tasks, tickets, D33 scenario, and release-evidence matrix.
2. Define the physical same-scope keys, head/lease CAS port, logical handoff
   cause with independent per-axis pins, D12 versioned retention start/release
   predicate, D80 receipt extension, retained readers, restrictive deletion/
   tombstone, and semantic-idempotency uniqueness without adding a parallel
   workflow table.
3. Reconcile proposed ADR-0156 and ADR-0167/OpenSpec: D23's user command still
   leaves its source unchanged; D80/D81 alone uses the same compiler inside a
   separately authorized create-and-clean command.
4. Preserve the reconciled ADR-0201 final **Move saved changes to new Page
   draft** consequence/action in the consolidated OpenSpec, design, and tickets.
5. Reconcile ADR-0203/D82's complete route provenance, fresh target claimant-
   ownership occurrence/version,
   private-History distinction, canonical equivalence, and receipt extension;
   carry ADR-0204/D83's exact qualified closure, truthful ordinary-D2 fallback,
   and proof gates before enabling a dependent descendant draft-path closure.

### Implementation safeguards required before activation

1. Implement stable Page/revision/public-pin/lease/compiler/owner substrate; do
   not wrap current Tenant-only Pages.
2. Qualify exact Payload/PostgreSQL transaction behavior with all writes awaited
   under one request; keep native duplicate/restore disabled.
3. Add old-writer and lease-generation fences before enabling the action.
4. Run authorization, cross-tenant, failpoint, concurrency, replay, retention,
   accessibility, weak-network, and production-capacity suites.
5. Exercise monitors/runbooks and prove global/cohort kill switches plus non-
   destructive roll-forward.

### Monitor rather than build now

- Observe mixed-change abandonment/support using the named signal; do not build
  semantic splitting or branches speculatively.
- Observe D33 latency/lock/retry and history volume; do not add a queue or saga
  without measured failure of the bounded transaction.
- Observe provider conformance on upgrades; do not duplicate Payload's version
  store or create a second history engine.

## Traceability and repository status

The permanent decision is
[ADR-0202](../../adr/0202-atomic-material-page-handoffs-append-clean-source-revisions.md).
It completes the D81 placeholder in
[ADR-0201](../../adr/0201-material-purpose-changes-create-independent-pages.md)
and depends on ADR-0200/D79 plus proposed Phase 23 ADR-0156/0167/0177 and the
reviewed `add-web-studio-cms` OpenSpec at PR #1340's current head.

At the review snapshot, local `HEAD` and fetched `origin/develop` were
`7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. Phase 22 PR #1323 remained
`OPEN/BLOCKED` at `70c50e8c97556c43be5543332fb0993b468b90ab`; Phase 23 PR
#1340 remained `OPEN/BLOCKED` at
`9069dcad67f9630323474ca5ee8bcc85ca7bf0f6`.

No runtime, schema, migration, Supabase policy, OpenSpec delta, ticket, Vercel/
DNS/TLS/Stripe request, deployment, or production state changed. D81 is
accepted documentation intent only and remains unavailable until its substrate
and proof gates pass. ADR-0203 additionally governs an exact Draft-only Path
Claim; ADR-0204 additionally governs one exact qualified source-descendant
derived closure. Every closure outside that cohort remains unavailable and uses
ordinary D2 cleanup first.

## D84 resolution and branch closure

ADR-0205/D84 resolves the target's initial sibling position through positive
D2 closed-boundary or known append-last provenance inside this same transaction
and against the post-D81/D82/D83 final baseline. It generates one fresh target
order result; only the sealed predecessor effects may advance affected heads,
and D84 causes no additional pre-existing Page parent/order write while
preserving final-cohort relative order. Navigation/public state stays
unchanged. Missing/unknown provenance and stale explicit boundaries remain
ordinary D2 position review. The D80-D84 handoff branch has no further founder-
level Placement question.

## References

- [ADR-0205 - Reviewed sibling placement with append-last default](../../adr/0205-reviewed-sibling-placement-with-append-last-default.md)
- [Phase 24 D84 adversarial review](./phase-24-d84-reviewed-sibling-placement-adversarial-review.md)
- [ADR-0204 - Atomic source-tree draft-path re-derivation](../../adr/0204-atomic-source-tree-draft-path-rederivation.md)
- [Phase 24 D83 adversarial review](./phase-24-d83-source-tree-draft-path-rederivation-adversarial-review.md)
- [ADR-0203 - Atomic adoption of exact draft-only Page path claims](../../adr/0203-atomic-adoption-of-exact-draft-only-page-path-claims.md)
- [Phase 24 D82 adversarial review](./phase-24-d82-atomic-draft-path-adoption-adversarial-review.md)
- [ADR-0202 - Material-purpose Page Handoffs append clean source Working successors](../../adr/0202-atomic-material-page-handoffs-append-clean-source-revisions.md)
- [ADR-0201 - Material Page-purpose changes create independent Pages](../../adr/0201-material-purpose-changes-create-independent-pages.md)
- [ADR-0200 - Stable Page identity with purpose-continuity versions](../../adr/0200-stable-page-identity-with-purpose-continuity-versions.md)
- [Proposed ADR-0156 - Working Revisions and active editor](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
- [Proposed ADR-0167 - Exact Site-owned content and Copy-to-Site drafts](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0167-exact-site-owned-ordinary-content-with-independent-copy-to-site-drafts.md)
- [Proposed ADR-0177 - Provider-neutral Production Capacity Profile](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0177-provider-neutral-production-capacity-profile-and-vercel-qualification.md)
- [Proposed ADR-0145 - Page-local composition and Public Site Generations](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [Proposed ADR-0146 - Staged hierarchical public paths](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0146-staged-hierarchical-public-paths-under-coherent-site-generations.md)
- [Payload Drafts](https://payloadcms.com/docs/versions/drafts)
- [Payload Versions](https://payloadcms.com/docs/versions/overview)
- [Payload transactions](https://payloadcms.com/docs/database/transactions)
- [Payload Local API access control](https://payloadcms.com/docs/local-api/access-control)
- [Sanity Content Releases](https://www.sanity.io/docs/studio/content-releases)
- [Contentful versioning](https://www.contentful.com/help/faq/versioning/)
- [WordPress.com revisions](https://wordpress.com/support/page-post-revisions/)
- [Blackbaud Page copy](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/lo/content/content_pagebuilder2_pages_copying_existing_page_use_as_model.html)
- [PostgreSQL transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html)
- [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [PostgreSQL explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html)
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase database functions](https://supabase.com/docs/guides/database/functions)
- [WCAG 2.2 error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html)
- [WCAG 2.2 on input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html)
- [WCAG 2.2 status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
