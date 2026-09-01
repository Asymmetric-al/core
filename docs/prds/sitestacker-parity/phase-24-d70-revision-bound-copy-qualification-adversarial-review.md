# Phase 24 D70 — Revision-bound Copy qualification adversarial review

**Date:** 2026-08-30  
**Founder answer:** Option 1 — structurally safe with visible source issues.  
**Final disposition:** **Accept with required amendments.**  
**Decision authority:** [ADR-0191](../../adr/0191-revision-bound-copy-qualification-with-non-gating-source-findings.md)

## Decision under review

The founder selected the best product direction: a saved private source should
remain available for parallel localization when Core can safely materialize it,
even when that source still has publication work. Requiring publication readiness
would duplicate release authority and make D69's private lane nearly pointless;
adding **Ready for translation** would create an unproved workflow.

The original wording was not implementable as written. “Structurally safe” did
not define supported content, unknown blocks, lossy omission, references, limits,
legacy readers, evidence freshness, or final recheck. “Visible issues” did not
identify the issue owner, handle partial/unavailable checks, protect private
details, or prevent source findings from becoming target truth. It also risked
using Payload validation or a successful save as authority, although Payload
intentionally permits incomplete drafts.

The corrected answer is **revision-bound Copy Qualification with visible,
non-gating Source Finding Summary**. Every D69 private or public source head must
have exact content-free qualification evidence and pass live/final checks. Source
publication findings remain advisory for Copy. The target validates separately,
and D1/D66 remain the only publication authorities.

## Current behavior, intended behavior, and permanent path

| Layer              | Verified current `develop` behavior                                                                                                                                | Intended D70 behavior                                                                                                            | Best permanent path                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Draft saving       | Pages enable Payload drafts and 300 ms autosave; `drafts.validate` and `strictDraftTypes` are not enabled. Required-looking fields may be absent in a saved draft. | Save remains available for incomplete content and is not Copy proof.                                                             | Preserve D12 acknowledgement as durability only; never turn on full draft validation to approximate D70.                                |
| Copy/localization  | No exact-locale lineage, Copy command, D69 projection, target Basis, or D70 qualifier exists.                                                                      | Every exact D69 head passes the same purpose-specific qualification.                                                             | Consume accepted D12/D22 resource profiles and ADR-0190; do not build from current template duplication.                                |
| Current validators | Payload field validators and current create-from-template checks cover prototype fields/references with Tenant-level seams; some paths use elevated clients.       | Product qualification is server-derived, exact-scope, profile/manifest-based, provider-neutral, and rechecked.                   | Keep provider validation/adapters subordinate; no `overrideAccess:true` or service-role proof path.                                     |
| Findings           | Current Web Studio shows provider validation/editor state but has no accepted D32 exact-revision source-finding projection.                                        | Known findings are visible, non-gating descriptions; partial/unknown coverage is truthful.                                       | Consume accepted D32/source-owner projections; D70 creates no finding catalog or ledger.                                                |
| Target validation  | No D70 target exists.                                                                                                                                              | Target structure validates atomically; target editorial findings derive independently afterward.                                 | Never copy source issue rows, favorable validation, review, approval, or dismissals.                                                    |
| Public runtime     | Current public reader has no D70 input; D66 requires exact favorable generation.                                                                                   | Qualification/finding evidence has no serving effect.                                                                            | D1/D66 alone validate publication; D70 never compiles public output.                                                                    |
| Database           | No D70 schema exists; current deployment isolates environment per Supabase project/database.                                                                       | Every enabled head has mandatory durable compact evidence; physical storage shape remains deferred to the accepted source owner. | Add no candidate/status table or setting; retain one unique same-scope immutable completed result, RLS/grants, and final command proof. |
| Formal authority   | D12/D22/D32 are in open blocked Phase 23 PR #1340; merged OpenSpec has no D66–D70.                                                                                 | D70 remains a groomed target decision.                                                                                           | Reconcile accepted equivalents and consolidate Phase 24 OpenSpec before design/tickets/implementation.                                  |

## Evidence classification

### Verified repository facts

- `apps/admin/src/cms/collections/pages.ts` marks title, slug, and content
  required while enabling drafts/autosave without `drafts.validate:true`.
- `apps/admin/payload.config.ts` does not enable Payload `strictDraftTypes`.
- Current template creation copies typed layouts and performs some Tenant/reference
  checks, but it is not exact Site/locale Copy authority and cannot be generalized
  into D70 by convention.
- Proposed ADR-0156 keeps Saved, structurally compatible, valid, reviewed,
  published, and serving distinct and requires exact acknowledgement/CAS.
- Proposed ADR-0166 owns the finite Localized Editorial Profile, exact-locale
  lineage, allowlisted Copy, permitted stable references, independent target, and
  cross-locale Reusable Section prohibition.
- Proposed ADR-0176 keeps Save, autosave, undo, recovery, Copy, comparison, and
  Preview available for **Details to finish**, **Suggestion**, and **Technical
  issue**; only pre-existing source/platform release invariants can block release.
- ADR-0190 already prohibits source validation-state transfer and requires an
  independently validated private target plus exact final authorization,
  manifest/reference, CAS, atomicity, and D67 publication proof.
- ADR-0187's five-family Site Locale Publication Contract is public-release
  closure, not Copy qualification or an every-ordinary-page completeness gate.

### Verified primary external evidence

| Source                                                                                                                                                                                               | Verified practice                                                                                                            | D70 use                                                                                        | Boundary retained                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [Payload Drafts](https://payloadcms.com/docs/versions/drafts)                                                                                                                                        | `draft:true` skips required-field validation by default and reads the latest versions row, not a purpose-specific safe copy. | Proves Saved/provider Draft cannot qualify Copy and incomplete drafts are normal.              | Core does not enable full draft validation or trust `_status`, row order, or provider errors.  |
| [Payload Fields](https://payloadcms.com/docs/fields/overview)                                                                                                                                        | Field validation is customizable/localizable and expensive validation should avoid every-change execution.                   | Supports source-owned validation and bounded revision-time proof.                              | Payload validation remains adapter behavior; D70 is provider-neutral and server authoritative. |
| [Sanity validation](https://www.sanity.io/docs/studio/validation) and [Content Lake validation](https://www.sanity.io/docs/content-lake/schema-validation-and-the-content-lake)                      | Drafts may contain errors/warnings; errors block publish; Studio rules alone do not secure API mutations.                    | Supports separate draft work, findings, publication gates, and server parity.                  | Core does not import Sanity severities/status or rely on client checks.                        |
| [Contentful validations](https://www.contentful.com/help/fields/available-validations/) and [release validation](https://www.contentful.com/help/launch/create-manage-release/setting-up-a-release/) | Structured validations and release validation prevent publication without preventing ordinary draft work.                    | Supports publication validation outside Copy/save.                                             | D1/source owners retain Core publication semantics.                                            |
| [Blackbaud draft forms](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/grantmaking/content/gc-forms-manage-draft-forms.html)                                                             | Staff can copy a draft as another draft and separately preview required fields/validation before publication.                | Comparable nonprofit evidence for private reuse before readiness.                              | Form behavior is evidence, not Core's content/profile/authorization model.                     |
| [Drupal content moderation](https://www.drupal.org/docs/8/core/modules/content-moderation/overview)                                                                                                  | Draft/public versions remain separate; Drupal normally starts translations from published source.                            | Establishes published-only as the strongest conservative alternative.                          | Core deliberately permits a proved private head because D67/D69 prevent premature public use.  |
| [Salesforce translation lifecycle](https://help.salesforce.com/s/articleView?id=sf.cms_translation_content.htm&language=en_US&type=5)                                                                | A Ready-for-Translation lock can support external XLIFF workflows.                                                           | Shows Option 3 is viable for organizations with a proven handoff need.                         | Core has no vendor-export need or tenant evidence, so it does not import the workflow.         |
| [Salesforce Enhanced CMS simplification](https://help.salesforce.com/s/articleView?id=release-notes.rn_experiences_enhanced_cms_translationlifecycle.htm&language=en_US&release=240&type=5)          | Enhanced CMS removed Ready for Translation and permits export from content in any status.                                    | Supports avoiding a mandatory handoff state when source qualification is independently proved. | Salesforce's coupled language publication behavior does not transfer to Core.                  |
| [WordPress revisions](https://wordpress.org/documentation/article/revisions/)                                                                                                                        | Autosaves and saved draft revisions remain distinct from published content.                                                  | Reinforces durability/publication separation.                                                  | Core uses exact D12 revision evidence, not WordPress storage semantics.                        |
| [W3C error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification) and [form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/)                         | Errors need concise textual identification and actionable guidance; multiple problems need usable structure.                 | Drives calm associated summaries, truthful unknown states, and focused blocking errors.        | D70 findings are not represented as form submission errors or modal interruptions.             |
| [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) and [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)                     | Grants and RLS differ; old/new row policies and structural constraints remain necessary.                                     | Preserves exact scope and caller/privileged-path defenses.                                     | RLS is defense in depth; trusted resource command is the product PDP.                          |

### Reasonable inferences

- Ministries coordinating launch translations benefit from using incomplete but
  meaningful source drafts; no frequency or conversion claim is made.
- Most D70 proofs can be emitted while D12 already holds canonical source input,
  avoiding chooser-time body scans.
- Candidate catalogs are normally small, but D70 retains D69's measured 300 ms
  budget rather than assuming cardinality.

### Product judgments

- **Copy Qualification** is the precise domain term; “structurally safe” remains
  plain-language explanation, not a stored status.
- Copy must make a meaningful target effect; otherwise Start blank is more honest.
- Known publication findings should remain visible but quiet; their existence is
  not a reason for warning color, ceremony, or disabled Copy.
- Compact immutable evidence plus a full selected-body recheck is the smallest
  safe seam between no eager body scans and no false offer.
- Detailed issue management belongs in the source editor, not the chooser.

### Assumptions and release evidence still required

- Accepted D12/D22/D32 physical contracts do not exist on `develop`; D70 cannot
  freeze table/provider shapes ahead of them.
- The exact allowed treatment and limits for every resource/block/reference must
  be code-owned and exhaustively tested; current layouts are not complete proof.
- Representative ministry editors must prove they understand **can be copied**
  versus **ready to publish** and source findings versus target findings.
- The local UI-skill search helper is unavailable at its configured path; this
  review therefore uses its written rules, Core primitives, and primary W3C
  evidence rather than claiming generated design-system output.

## Ruthless category review

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes.** **What could go wrong:** Core could build a new
qualification system when published Copy or Start blank is sufficient, or could
allow every saved draft without proof. **Why it matters:** the first creates
unneeded machinery; the second corrupts targets. **Severity: Medium. Likelihood:
Medium.** Blackbaud supports draft-to-draft Copy and Drupal supports the stronger
published-only alternative, but Core tenant frequency remains unmeasured.
**Decision effect:** narrows Option 1 and keeps published/blank degradation.
**Permanent fix:** one revision-bound qualifier embedded in existing source
profiles; require task evidence before private activation. **Exact spec
language:** D70-R1, R5, R11, R17–R18; AC1–AC4, AC27, AC30.

### 2. Brittleness

**Material concern: Yes.** **What could go wrong:** “saved,” `required`, Payload
validation, or provider status may work until schema, block, rule, or provider
versions change. **Why it matters:** a new or legacy block can be silently lost.
**Severity: High. Likelihood: High.** Current Payload deliberately skips draft
required validation and current Core has evolving block shapes. **Decision
effect:** replaces vague safety with exact retained reader/profile/manifest/
digest evidence and final recheck. **Permanent fix:** immutable versioned proof,
declared compatibility, and fail-closed unknown input. **Exact spec language:**
D70-R1–R6, R17; AC2–AC10, AC25–AC28.

### 3. Technical debt

**Material concern: Yes.** **What could go wrong:** a generic validator, copied
field list, candidate table, `copy_safe` Boolean, per-Tenant rules, or duplicated
D32 issue store creates dual truth. **Why it matters:** every new field/package
requires several synchronized systems and migrations. **Severity: High.
Likelihood: High.** Proposed D22 already co-locates typed manifests with resource
contracts. **Decision effect:** substantially narrows implementation. **Permanent
fix:** extend the accepted resource profile/revision attachment only; no new
settings/workflow/ledger. **Exact spec language:** D70-R2–R5, R8, R11; AC5–AC10,
AC17–AC19, AC27.

### 4. Edge cases

**Material concern: Yes.** **What could go wrong:** missing values, unknown nodes,
empty copy effect, over-limit trees, corrupt rich text, nontransferable or missing
references, old published versions, partial checks, changed rules, and target
projection failure can produce inconsistent UI/data. **Why it matters:** staff
may lose meaning or believe Copy/target health succeeded. **Severity: High.
Likelihood: High** as profiles evolve. **Decision effect:** adds exhaustive
treatments, limits, unknown states, and independent target truth. **Permanent
fix:** code-owned classification and complete boundary tests. **Exact spec
language:** D70-R2–R10, R15, R17; AC2–AC20, AC24–AC28.

### 5. Footguns

**Material concern: Yes.** **What could go wrong:** green **Ready**, red
**Invalid**, disabled radios, source issue inheritance, client-supplied safe
status, silent omissions, or nested controls inside a radio can mislead or cause
accidental selection. **Why it matters:** copyability, source readiness, and
target readiness are different facts. **Severity: Critical. Likelihood: High**
without exact language/semantics. **Decision effect:** changes the UX and
command contract. **Permanent fix:** no favorable badge, unselected full-row
radio, associated non-gating summary, no nested action, server proof, and no
issue transfer. **Exact spec language:** D70-R4, R7–R11; AC3–AC4, AC11–AC20,
AC29–AC30.

### 6. Tenant safety

**Material concern: Yes.** **What could go wrong:** evidence, issue counts,
unknown reasons, blocks, references, or candidate timing may reveal another
Tenant/Site/resource/locale. **Why it matters:** private ministry plans and
missionary/location information can leak. **Severity: Critical. Likelihood:
Medium** without preprojection filtering. **Decision effect:** requires complete
scope/non-enumeration and content-free evidence. **Permanent fix:** trusted scope,
viewer-shaped summary, batched scoped references, private no-store, and hostile
fixtures. **Exact spec language:** D70-R5–R6, R8, R12–R15; AC13, AC21–AC24,
AC28–AC29.

### 7. Database, RLS, and authorization safety

**Material concern: Yes.** **What could go wrong:** caller-written qualification,
nullable/unscoped or non-durable evidence, duplicate/conflicting completed
results, mutable outcomes, broad grants, missing `WITH CHECK`, service/Payload
bypass, or evidence without a revision FK may authorize a target.
**Why it matters:** permitted updates could transform proof into another scope or
leave dangling truth. **Severity: Critical. Likelihood: High** unless the D69
boundary is preserved. **Decision effect:** adds exact-revision evidence
constraints without a D70 candidate/status table. **Permanent fix:** one durable
same-scope immutable completed result per complete identity, idempotent work,
restrictive deletion, purpose indexes, trusted derivation, minimum
grants, applicable FORCE RLS, correct `USING`/`WITH CHECK`, hardened functions,
and poison tests. Money/storage fields are not introduced. **Exact spec language:**
D70-R5–R6, R11–R14; AC7–AC10, AC16, AC21–AC23, AC27–AC29.

### 8. Overengineering

**Material concern: Yes.** **What could go wrong:** Ready-for-translation,
approval, task, issue dashboard, external scanner, whole-Site compile, per-field
workflow, or eager candidate scanning may turn Copy into a localization platform.
**Why it matters:** staff wait and Core duplicates D1/D32. **Severity: High.
Likelihood: High** given the undefined word “safe.” **Decision effect:** rejects
those additions. **Permanent fix:** one revision attachment, one compact source
summary, and existing source handoff. **Exact spec language:** D70-R1, R5,
R7–R11, R15–R18; AC1, AC11–AC20, AC24, AC27.

### 9. UX/UI and user friction

**Material concern: Yes.** **What could go wrong:** vague “issues,” counts without
complete coverage, long lists, nested radio actions, truncated locale/status,
small close/radio targets, or alerting advisory changes overwhelms occasional
editors. **Why it matters:** staff must know Copy is allowed and target checks
remain without training. **Severity: High. Likelihood: High.** Current shared
radio/Sheet primitives need deliberate full-row/mobile target composition and
W3C requires concise textual/actionable feedback. **Decision effect:** replaces
generic copy and adds implementation proof. **Permanent fix:** generation/
watermark-bound D32 terms, truthful partial/unknown states, scoped busy regions,
separate lazy detail/handoff, composed target readiness with bounded retry, 44 px
rows/close, full-width mobile, no truncation, and bounded announcements. **Exact
spec language:** D70-R7–R10, R15, R18; AC11–AC15,
AC18–AC20, AC24, AC29–AC30.

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes.** **What could go wrong:** Payload validators, D12 Save,
D22 manifest, D32 findings, D70 evidence, D69 candidates, and D1 readiness could
all claim “valid.” **Why it matters:** a read model may become mutation/public
authority. **Severity: Critical. Likelihood: High** without separated vocabulary.
**Decision effect:** establishes explicit owners/invariants. **Permanent fix:**
D12 revision, D22 profile, source findings, D70 qualification, D69 effect, D67
Basis, and D1/D66 publication remain disjoint. **Exact spec language:**
D70-R1–R11, R16; AC1–AC20, AC23.

### 11. Hidden coupling

**Material concern: Yes.** **What could go wrong:** changing a D32 suggestion,
Payload validation option, public critical-path inventory, provider version, or
issue count may unexpectedly remove Copy or stale a selection. **Why it matters:**
unrelated editorial/platform changes serialize translation. **Severity: High.
Likelihood: High.** Proposed D32 explicitly promises Copy for all finding
classes. **Decision effect:** issue-summary changes become display-only; only
qualification-affecting facts conflict. **Permanent fix:** versioned contracts,
separate evidence/summary, selected-head final proof, and no D1 compile.
**Exact spec language:** D70-R4–R9, R14–R17; AC3–AC4, AC11–AC16, AC24–AC27.

### 12. Failure modes

**Material concern: Yes.** **What could go wrong:** evidence writer, live
reference check, summary, target findings, or final command can fail or disagree;
a transient evaluation failure can become permanent, or a lost response can duplicate
work. **Why it matters:** false healthy/unavailable states, permanently stranded
unchanged drafts, or partial targets erode trust. **Severity: High. Likelihood:
Medium-high**
in mixed deployments/networks. **Decision effect:** adds independent fail-open/
closed behavior by purpose. **Permanent fix:** qualification unknown fails only
that candidate closed with idempotent bounded reconciliation; findings unknown
stay truthful/non-gating; final proof creates none on failure; target finding
outage stays private with Check again; D69 receipt reconciles ambiguity. **Exact
spec language:** D70-R5–R10, R14–R18; AC11–AC20,
AC24–AC29.

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes.** **What could go wrong:** source head, profile, rule,
safety, permission, or reference changes between evidence, display, selection,
and commit; concurrent evidence writers conflict; an unknown public head hides a
qualified equal-input private head; two target starts race; same request retries.
**Why it matters:**
individually valid events can create an invalid target. **Severity: Critical.
Likelihood: High** in collaborative editing/deploy skew. **Decision effect:**
adds exact attachment identity, per-head-before-dedupe ordering, structurally
unique/idempotent evidence, selected-body/live recheck, and distinguishes finding-only change.
**Permanent fix:** D69 CAS/idempotency/unique target plus deterministic qualifier
versions and retained readers. **Exact spec
language:** D70-R1–R6, R9, R13–R17; AC2, AC5–AC10, AC14–AC17, AC25–AC28.

### 14. Data integrity risks

**Material concern: Yes.** **What could go wrong:** silent field loss, coerced
values, false references, zero-effect Translated target, copied issue rows,
profile drift, contradictory same-identity evidence, or dangling evidence corrupts
history/reporting. **Why it matters:**
staff cannot reconstruct what target meaning came from the source. **Severity:
Critical. Likelihood: High** without exhaustive treatment and structural proof.
**Decision effect:** requires meaning-preserving classifications, material effect,
exact digest/version pins, and independent target findings. **Permanent fix:**
fail unknown/loss, safe omission only by owner, restrictive evidence lifecycle,
one structurally unique durable completed result, and fault/migration tests. **Exact spec
language:** D70-R2–R6, R10–R14, R17;
AC5–AC10, AC16–AC20, AC25–AC28.

### 15. Security and privacy risks

**Material concern: Yes.** **What could go wrong:** mass assignment copies
unclassified private fields, source finding text leaks, external scans egress
drafts, logs hold content, or elevated paths forge proof. **Why it matters:**
sensitive ministry/member-care data can cross locale/scope or third parties.
**Severity: Critical. Likelihood: High** if generic provider duplicate/validation
is reused. **Decision effect:** adds manifest allowlisting, content-free evidence,
no remote scanning, data minimization, and privileged-path parity. **Permanent
fix:** server DTOs, current reference authorization, source-owner retention/legal
erasure with minimum live reference identities, no bodies/issues in logs/cache/
receipt, non-enumeration, and poison tests. **Exact spec language:** D70-R2–R6,
R8, R10–R16; AC5–AC10, AC13, AC18, AC21–AC24, AC28–AC29.

### 16. Scalability and performance risks

**Material concern: Yes.** **What could go wrong:** eager body/whole-Site scans,
per-candidate references, heavy work on every 300 ms autosave, or shared caching
makes Save or the picker slow/unsafe. **Why it matters:** multilingual Sites and
weak field networks would fail the ordinary editing task. **Severity: Medium-high.
Likelihood: Medium.**
Payload warns expensive validation should not run on every change, and production
cardinality is unmeasured. **Decision effect:** requires revision-time compact
evidence and batched live facts within D69's budget without coupling Save.
**Permanent fix:** pure bounded asynchronous evaluation coalesced to the useful
current/protected head frontier, one complete source-contract digest, no bodies/
history in enumeration, exact selected-body recheck only, indexed reference
queries, no remote work/shared private cache. **Exact spec language:** D70-R5–R6,
R15, R17–R18; AC12–AC13, AC24–AC27, AC30.

### 17. Operational burden

**Material concern: Yes.** **What could go wrong:** admins manually requalify
drafts, clean copied issues, repair silent loss, manage a workflow, or patch
legacy proof. **Why it matters:** self-service localization becomes developer-
dependent. **Severity: High. Likelihood: Medium.** A source-owned post-
acknowledgement hook can idempotently request bounded evaluation without making
D12 wait or adding a D12 domain effect.
**Decision effect:** removes manual
operations and retains safe degradation. **Permanent fix:** automatic immutable
evidence, bounded source-owner reconciliation/Check again for retryable unknown,
code-owned profiles, exact migration, start-blank/published fallback,
and writer-off rollback. **Exact spec language:** D70-R5, R10–R11, R17; AC1,
AC17–AC20, AC25–AC28.

### 18. Observability and auditability gaps

**Material concern: Yes.** **What could go wrong:** logs cannot distinguish false
offer, unknown proof, reference rejection, finding outage, or target projection
failure; content-rich diagnostics may leak. **Why it matters:** diagnosis and
safe recovery become impossible. **Severity: High. Likelihood: Medium.** D70
crosses writer, projection, command, and target validation. **Decision effect:**
adds content-free reason/profile/digest evidence, save-interference/backlog proof,
and monitors. **Permanent fix:** cause-coded metrics, D69 receipt correlation, no field values/high-cardinality
private IDs, and exact thresholds/owners/responses. **Exact spec language:**
D70-R5–R6, R8–R10, R14, R17–R18; AC11–AC20, AC24–AC30, monitors below.

### 19. Dependency and integration risks

**Material concern: Yes.** **What could go wrong:** Payload draft-validation
changes, generated types, plugin blocks, D32/D22 changes, external scanners, or
current elevated prototype paths can redefine qualification. **Why it matters:**
provider upgrades or unmerged ADRs could alter eligible content. **Severity:
High. Likelihood: High** with an internal Payload v4 pin and open Phase 23.
**Decision effect:** makes activation dependency/evidence-gated. **Permanent fix:**
provider-neutral profile/evidence contract, exact-pin tests, retained readers,
no external dependency, and accepted-equivalent reconciliation. **Exact spec
language:** D70-R1–R6, R11–R18; AC1–AC10, AC21–AC30.

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes.** **What could go wrong:** infer `copy_safe` from current
Payload status/required fields/history, expose UI before evidence writers/readers,
or roll back to readers that cannot interpret new evidence-contract versions/content.
**Why it matters:** existing drafts
gain false proof and mixed versions silently lose meaning. **Severity: Critical.
Likelihood: Certain** under a naïve backfill because current data has no D70
evidence. **Decision effect:** forbids inference and requires staged writer/
reader/command/target deployment. **Permanent fix:** complete exact-reader
qualification only, compatible durable evidence readers, shadow proof,
cohort activation, fail-closed legacy, and
writer-off/roll-forward rollback. **Exact spec language:** D70-R5–R6, R17–R18;
AC5–AC10, AC25–AC30.

### 21. Testability, traceability, and proof

**Material concern: Yes.** **What could go wrong:** a test can assert “row shown”
while data was lost, source findings copied, API bypassed, or target falsely
publishable. **Why it matters:** implementation-detail tests miss domain/user
outcomes. **Severity: High. Likelihood: High** without exact predicates.
**Decision effect:** requires D70-R1–R18 and AC1–AC30 across every path.
**Permanent fix:** positive/negative/boundary/auth/concurrency/migration/a11y/
production-shaped tests and full artifact traceability. **Exact spec language:**
D70-R18; AC1–AC30.

### 22. Other development hazards

**Material concern: Yes.** **What could go wrong:** treating ADR Accepted as
implementation authority, relying on absent UI search output, freezing proposed
Phase 23 table shapes, or letting D71 presentation leak unavailable drafts can
produce rework/security defects. **Why it matters:** grooming is not merged
OpenSpec and the dependencies are unsettled. **Severity: High. Likelihood: High.**
Repository state proves those gaps. **Decision effect:** D70 remains docs-only
and explicitly gates D71/OpenSpec. **Permanent fix:** reconcile dependencies,
record D71, consolidate OpenSpec, then design/ticket/implement with release
proof. **Exact spec language:** D70-R11, R17–R18; AC21–AC30.

## Exact normative requirements

### D70-R1 — Uniform purpose-specific qualification

Every enabled private or public D69 source candidate MUST pass the same exact-
revision Copy Qualification. Saved, published, provider-valid, client-valid,
previewed, or previously copied MUST NOT substitute. Each exact head MUST qualify
before enabled-candidate deduplication; an unknown/unqualified public head MUST
NOT hide a qualified equal-input private head.

### D70-R2 — Complete supported input

Qualification MUST bind the exact revision/digest and retained schema, resource/
copy profile, manifest, canonicalization, qualifier, block/node/package versions,
and declared count/depth/byte limits. The complete present input MUST be
recognized, deterministically decodable, and within limits. One collision-
resistant versioned source-contract digest MUST transitively cover every named
source-side version and limit.

### D70-R3 — Exhaustive meaning-preserving treatment

Every recognized value/reference MUST be classified as copied value, preserved
authorized target-compatible stable reference, owner-defined deterministic target
repair, explicit meaning-preserving safe omission, or never-copy. Unknown,
ambiguous, corrupt, executable, lossy, coercive, inferred, fallback-resolved,
silently omitted, or unclassified meaning MUST fail. A result with no meaningful
source effect MUST use Start blank and MUST NOT create Translated provenance.

### D70-R4 — Publication findings do not qualify Copy

Missing release values, accessibility details/suggestions, untranslated prose,
review, approval, paths, SEO, schedules, public dependencies, and D1/D66 closure
MUST NOT block Copy when D70 proof independently succeeds. An accepted D32-
equivalent Details to finish, Suggestion, or Technical issue class MUST remain
Copyable; only an independent Copy-contract proof failure may make it unavailable.

### D70-R5 — Immutable compact evidence

D12 authoritative acknowledgement MUST remain side-effect-dark. A source-owned
post-acknowledgement hook MUST start or reuse a pure, bounded, coalesced evaluation
of the exact Working Revision content that emits content-
free Copy Qualification Evidence for that exact revision/
digest. For a legacy D1 current published revision without evidence, its
source owner MAY evaluate it only after retained-reader and canonical-digest
proof; a future D1 publication of an evidenced D12 revision MUST reuse that
identity. Evidence records source-side contract versions and proved source-input-
qualified/source-input-not-qualified, material-effect presence,
reference identities, and a bounded safe reason class. It MUST NOT claim a future
target locale/profile, actor, authority, lifecycle, or reference admission and
MUST NOT be full Copy Qualification alone.

The accepted design MUST durably attach at most one immutable, content-free
completed evidence result per complete same-scope source-revision/canonical-
digest/source-contract-digest identity. That complete identity MUST be the
idempotency/uniqueness key; same identity reuses the same deterministic result and
changed contract version creates a distinct identity. Missing, queued,
in-progress, failed, or timed-out evaluation MUST project retryable unknown and
MUST NOT be evidence or favorable. Bounded source-owner reconciliation or
authorized Check again MAY idempotently request the same identity; attempt/retry
state MUST remain in the accepted source-owner durable-work mechanism, not the
revision attachment. Evaluation MUST NOT delay or fail D12 Save, autosave, or
acknowledgement. Evidence MUST NOT be a mutable/latest status, workflow, issue,
candidate, or publication result.

Operational work MUST coalesce to the useful exact-head frontier: a newer D12
Working Revision MAY supersede pending work for an older unretained/unprotected
private revision, while the current D12 head, D1 current published revision, and
any revision referenced by a retained D69 Copy Source Checkpoint/Basis MUST NOT be
incorrectly skipped or invalidated.
Private/public heads MUST receive fair capacity, and supersession MUST NOT mutate
completed evidence.

### D70-R6 — Projection and final recheck

Candidate enumeration MUST independently compose each exact private/public head's
compatible source evidence with the exact
target locale/profile and one batched live scope/authorization/lifecycle/safety/
reference query without source-body/diff/history reads. Missing/unknown/
mismatched/incompatible evidence MUST NOT be favorable. Only enabled qualified
heads may deduplicate; equal input prefers public only when the public head is
also qualified.
After selection, the trusted D69 command MUST read the exact body, verify digest/
versions/limits, rerun complete qualification and reference authorization, and
only then write. Evidence alone MUST NOT authorize.

### D70-R7 — Source findings remain source-owned

D70 MUST consume only a viewer-authorized Source Finding Summary from accepted
source/D32 owners. It MUST bind exact revision/digest, current compatible
validator/rule generation, evaluated coverage watermark, `complete | partial |
unavailable` completeness, and the authorized class set. It MUST NOT create/
reclassify findings, severity, rules, issue storage, tasks, assignments,
notifications, waivers, approvals, or release gates.

### D70-R8 — Truthful known, partial, and unavailable summary

Known applicable source finding classes MUST remain visible. Partial coverage
MUST retain known findings and say some checks are unavailable; complete outage
MUST say checks are unavailable. Missing/stale/unauthorized evidence MUST NOT
become zero, green, passed, ready, or ready-to-publish. An old rule generation,
incomplete watermark, missing owner, or failed check MUST NOT project complete or
clear. Finding loading/failure MUST NOT block separately proved qualification.

### D70-R9 — Accessible bounded chooser UX

The ADR-0191 compact finding summary MUST be associated description outside the
radio's essential accessible name. No action/detail MAY be nested in the full-row
label. Optional post-selection detail/handoff MUST be separate, lazy, focus-safe,
and non-gating. Essential text MUST wrap without truncation; full rows, close,
footer actions MUST meet Core's 44 px convention; mobile Sheet MUST be full-width
single-column with reachable safe-area footer. An unqualified D71 item MUST NOT
be a disabled radio. Candidate qualification MAY mark only the candidate-result
region busy; later finding refresh MUST scope busy/status to its summary subregion
and leave the RadioGroup operable.

### D70-R10 — Independent target validation

The command MUST structurally validate target creation atomically. Afterward the
target MUST derive its own locale/profile/rule findings. Source finding rows,
counts, classes, favorable outcomes, review, approval, Keep-as-written,
schedules, paths, and publication evidence MUST NOT transfer. Immediately after
Copy, the just-created target MUST remain the private draft the command created
and say **Target checks are unavailable right now. Your draft is saved and
private.** An authorized bounded **Check again** MUST retry only the finding owner;
one readiness region MUST retain any independent D67 blocker/action without
conflating or clearing either condition. The outage MUST NOT change current
publication state and MUST NOT independently block or satisfy a later D1/D66
publication proof.

### D70-R11 — No new policy or workflow

D70 MUST add no Ready-for-translation state, approval, handoff lock, Site/Tenant
setting, capability, generic validator, whole-Site compile, issue viewer, external
scanner/model, candidate table, or status column. Bounded source-owner automatic
reconciliation/Check again for retryable unknown qualification is recovery, not a
readiness workflow, approval, or staff-authored requalification state.

### D70-R12 — Tenant/privacy/authorization boundary

Trusted server context MUST derive actor, Tenant, environment, Site, resource,
source/target locale, revision, capability epoch, and time. Evidence, qualification,
finding existence/count/text, reason, reference, and content MUST be viewer-
filtered and non-enumerating. Actor-scoped Payload calls MUST use authenticated
context and `overrideAccess:false`; callers/AI/providers MUST NOT assert proof.

### D70-R13 — Data, grants, and RLS invariants

The accepted design MUST durably attach evidence as immutable same-scope exact-
revision metadata with restrictive deletion, retained-reader support, purpose
indexes, and one structurally unique completed result per complete evidence
identity. Same-identity work is idempotent and operational retry state MUST NOT
become revision evidence. D69's complete scoped relationships,
exactly-one Basis, minimum grants, applicable FORCE RLS,
operation-correct `USING`/`WITH CHECK`, security-invoker views, hardened functions,
and direct-DML/privileged-path poison tests MUST preserve the same boundary.
Evidence MUST follow D12/source-owner retention and legal erasure, minimize
reference identities to live qualification need, become unusable/non-enumerating
when a source/reference is erased or revoked, and leave no dangling/reusable
favorable proof. Minimum D69 historical tombstones MUST NOT reauthorize Copy.

### D70-R14 — Temporal and idempotent behavior

Source-head, profile/manifest/qualifier compatibility, lifecycle/safety,
permission, preserved-reference, or target-head change MAY invalidate Copy and
MUST create nothing on failed recheck. Finding-summary/rule presentation change
alone MUST NOT invalidate the selected exact source or idempotency meaning. D69
selected-lane CAS, unique target, receipt replay, and deterministic lock order
remain authoritative. Concurrent same-identity evaluation MUST reuse the one
deterministic completed result; no timestamp/current-result selector exists.

### D70-R15 — Bounded reads, cache, and failure

Evidence/live qualification MUST remain inside D69's existing p95 300 ms metadata
budget without per-candidate body/history N+1, remote work, or public/shared/
Vercel/persistent browser cache. Qualification outage MUST fail only that
candidate closed; finding outage MUST remain non-gating/unknown; final failure
creates nothing; target-finding outage leaves a private target with truthful
status and bounded recovery. Source-side evaluation MUST be pure, bounded,
canonical-digest/contract-coalesced, asynchronous to acknowledgement, and unable
to delay or fail D12 Save. Work MUST stay bounded to the useful exact-head
frontier rather than grow with every superseded autosave; retryable unknown
reconciles later.

### D70-R16 — No public or adjacent-domain authority

Qualification evidence and source findings MUST NOT be public-reader/runtime/
serving, favorable-generation, route, search, SEO, cache, Vercel, Giving,
currency, Stripe, settlement, message, receipt, document, or payment authority.
D1/D66 MAY independently validate the target publication candidate but MUST NOT
treat D70 qualification as favorable proof.

### D70-R17 — Migration, rollout, and rollback

Migration MUST NOT infer qualification from provider status, fields/types,
validation, history, timestamps, or saves. Only complete retained-reader/digest
proof for an explicit D12 Working Revision or D1 exact current published revision
may attach evidence; withdrawn/prior publication, arbitrary history, and provider
latest MUST NOT substitute. Readers/evidence writers,
projection, final command recheck, and target validators MUST land before cohort
activation. Unknown legacy content fails closed. Kill/rollback MUST preserve
qualified alternatives, Start blank, existing evidence/readers/targets/findings/
Basis/receipts/blockers/remediation and remain writer-off/roll-forward.

### D70-R18 — Dependency, proof, and traceability gate

Activation MUST require accepted D12/D22/D32 equivalents, D67-D71, consolidated
Phase 24 OpenSpec, exact Payload-pin/provider-neutral conformance, complete
resource/manifest/reference/limit coverage, production-shaped security/fault/
concurrency/migration/performance/a11y tests, and representative ministry-editor
proof. D70 MUST trace without contradictory vocabulary or numbers through every
artifact and release evidence.

## Falsifiable acceptance criteria

1. **AC1 — Current-state truth:** current develop exposes no D70 product behavior;
   documentation does not authorize runtime/schema/provider changes.
2. **AC2 — Incomplete qualified private draft:** an exact acknowledged draft
   missing publication-required values remains selectable when complete D70 proof
   succeeds.
3. **AC3 — Finding classes:** Details to finish, Suggestion, and non-copy-
   affecting Technical issue each remain selectable and visibly non-gating.
4. **AC4 — Publication facts:** missing equivalent text, SEO, path, review,
   approval, schedule, or D1/D66 closure alone cannot remove a qualified source.
5. **AC5 — Unknown input:** unknown block/node/package/profile/manifest version
   is not offered and final recheck creates nothing.
6. **AC6 — Corrupt/ambiguous/over-limit:** malformed structure, nondeterministic
   canonicalization, count/depth/byte limit and +1 boundary fail deterministically.
7. **AC7 — No silent loss:** truncation, coercion, inference, fallback, silent
   omission, or unclassified field/reference cannot produce a target.
8. **AC8 — Stable reference:** only currently existing, typed, lifecycle-eligible,
   authorized, scoped, and target-compatible references preserve; hostile cases
   fail non-enumeratively.
9. **AC9 — Owner-defined repair/omission:** a nontransferable dependency creates
   only its owner-declared safe target repair/omission; absent proof fails.
10. **AC10 — Meaningful effect:** zero source effect offers Start blank and never
    creates Translated provenance.
11. **AC11 — Known source summary:** qualified known findings render the exact
    applicable calm source-owner terms and helper, bound to exact revision/digest,
    current rule generation, complete evaluated watermark, completeness, and
    authorized classes, without Ready/Passed/green.
12. **AC12 — Partial checks:** known findings remain while partial coverage adds
    unavailable-check text; old rule generation or incomplete watermark never
    reports a complete count or clear state.
13. **AC13 — Complete finding outage:** candidate remains selectable only with
    proved qualification and says source checks unavailable; no false zero.
14. **AC14 — Non-gating refresh:** finding load/refresh/failure never clears a
    qualified selection, moves focus, or invalidates submit/idempotency; its busy/
    status scope leaves the candidate RadioGroup operable.
15. **AC15 — Qualification loss:** selected qualification/head/reference/auth/
    safety loss clears selection on refresh, blocks submit, focuses exact cause,
    and creates nothing.
16. **AC16 — Public lane parity:** a legacy D1 current published source may gain
    evidence only through retained-reader/digest proof and requires the same final
    qualification; status or prior/withdrawn history cannot bypass unknown
    schema/reference.
17. **AC17 — Exact evidence writer/reuse:** D12 acknowledgement stays side-effect-
    dark; its source-owned post-ack hook idempotently requests pure bounded
    evaluation without delaying or blocking Save. Successful asynchronous
    completion attaches at most one immutable content-free result per
    complete identity, and same-key concurrent/lost-response work reuses that
    deterministic result. Failed/in-progress work stays unknown outside revision
    evidence and Check again requests the same identity. A future D1 publication
    reuses evidence for that exact revision, while a proved legacy current
    publication receives one source-owned result; caller/provider fields cannot
    create/alter it. Any +1 schema/profile/manifest/canonicalization/qualifier/
    block/node/package version or count/depth/byte limit changes the source-
    contract digest and therefore cannot reuse the old result.
18. **AC18 — Projection/body boundary:** picker uses evidence and one batched
    live query; it performs no candidate body/diff/history read or N+1. It
    qualifies both exact heads before dedupe, so an unknown public head cannot
    hide an equal-input qualified private head.
19. **AC19 — Final body recheck:** selected command reads exact body, verifies
    digest/versions/limits/references, and defeats corrupt/stale favorable evidence
    before any write.
20. **AC20 — Independent target truth:** target structural validation occurs in
    creation; target findings derive independently and may differ; no source
    issue/review/favorable state enters target/Basis/receipt/audit.
21. **AC21 — Target finding outage:** the newly created target is initially the
    private draft Copy promised and says checks are unavailable right now and the
    draft is saved/private. It offers authorized bounded Check again, composes
    rather than replaces D67's blocker/action, does not change later publication
    state, and neither blocks nor satisfies D1/D66 proof; creation receipt stays
    historical.
22. **AC22 — Tenant/security:** cross-Tenant/Site/environment/resource/locale,
    hidden issue/reference, forged evidence, public/cache, service/Payload/
    worker/importer/AI paths reveal or write nothing.
23. **AC23 — RLS/constraint proof:** scoped FK/uniqueness/restrictive deletion,
    grants, `USING`/`WITH CHECK`, views/functions/indexes, exact-one Basis, and
    direct/privileged poison tests pass, including concurrent duplicate evidence
    writers, attempts to insert a second/conflicting result for one identity, and
    retained evidence deletion. Erased/revoked source or reference leaves no
    enumeration, dangling FK, or reusable favorable evidence; minimum historical
    tombstone never authorizes Copy.
24. **AC24 — Performance/cache:** maximum declared catalog meets D69 p95 300 ms
    with no body/history/N+1/remote/shared cache; target/finding loading reserves
    space and remains truthful. Qualification work is digest/contract-coalesced,
    never increases D12 acknowledgement beyond its accepted Save SLO, never fails
    Save, and its retry backlog remains within the release-fixed reconciliation
    SLO. Sustained maximum-size autosave does not create work proportional to
    every superseded revision; current private/public heads receive fair capacity.
25. **AC25 — Temporal races:** source/profile/reference changes fail; finding-only
    changes do not; unselected lane remains irrelevant; same retry resolves one
    D69 receipt/target. Superseding queued old private work cannot cancel current-
    public proof or a revision referenced by a retained D69 Copy Source
    Checkpoint/Basis, and never mutates a completed result.
26. **AC26 — Migration/deploy skew:** only explicit exact-reader/digest proof for
    a D12 Working Revision or D1 exact current publication attaches legacy
    evidence; no provider/history inference occurs, incompatible versions fail
    closed without data loss, and retained readers survive rollback.
27. **AC27 — Safe kill/rollback:** disabling private writer preserves blank/
    qualified public paths and every existing reader/evidence/target/finding/
    Basis/receipt/blocker/remediation.
28. **AC28 — Provider parity:** installed Payload pin and provider-neutral fake
    pass identical incomplete-save/evidence/unknown/final-recheck contracts;
    `overrideAccess:true` and service-role prototype paths cannot prove D70.
29. **AC29 — Accessible UX:** single unselected radio group, associated summary,
    separate disclosure/handoff, 44 px full rows/close/actions, full-width mobile,
    focus/announcements, no truncation, keyboard/screen-reader/touch/forced-color/
    reduced-motion/320px/400%/long/CJK/RTL/bidi/weak-network tests pass; later
    finding refresh never marks or disables the entire group as busy.
30. **AC30 — Traceability and user proof:** founder answer, glossary, ADR-0191,
    D70-R1–R18, OpenSpec, design, tickets, code, tests, and release evidence agree;
    at least five representative ministry editors including disabled/mobile use
    complete the task with zero critical confusion between copyability,
    source readiness, target findings, or publication readiness.

## Required monitors

| Signal                                                               |                                                                                                                                                         Threshold | Owner                                         | Required response                                                                                                                                                                    |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------: | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `translation_copy_d70_false_offer_total`                             |                                                                                                                                                  Any in 5 minutes | CMS Platform + Security                       | Disable affected Copy profile/head offers across private and public candidates, preserve evidence and Start blank, inspect qualifier/digest/auth path, and re-prove before enabling. |
| `translation_copy_unknown_manifest_input_accept_total`               |                                                                                                                                                               Any | CMS Platform                                  | Disable affected profile/candidate, preserve target evidence, inspect manifest coverage, and add a governed compatible successor before re-enable.                                   |
| `translation_copy_forbidden_reference_accept_total`                  |                                                                                                                                                               Any | Security + CMS Platform                       | Disable affected Copy, contain scope, inspect reference/live-proof path, and run hostile-scope proof before restoration.                                                             |
| `translation_copy_silent_omission_total`                             |                                                                                                                                                               Any | CMS Data Integrity                            | Disable affected profile, compare source/targets, preserve history, repair only through explicit successors, and open P0 integrity incident.                                         |
| `translation_copy_source_finding_inheritance_total`                  |                                                                                                                                                               Any | CMS Platform + Accessibility/validation owner | Disable affected target creation, remove no history, derive target findings afresh, and repair transfer/serializer contract.                                                         |
| `translation_copy_finding_summary_disclosure_total`                  |                                                                                                                                               Any confirmed event | Security + Web Studio                         | Remove affected summaries/head offers regardless of private/public kind, preserve Start blank, purge private caches, investigate projection/logs, and re-prove non-enumeration.      |
| `translation_copy_finding_summary_false_clear_total`                 |                                                                                                                                                               Any | Web Studio + source validation owner          | Remove favorable summary, show checks unavailable, repair watermark/rule coverage, and never block Copy merely from finding state.                                                   |
| `translation_copy_d70_evidence_command_disagreement_ratio`           | Greater than 1% for 30 minutes with at least 20 attempts, comparing only the same exact body/digest/static contract and excluding every declared live-fact change | CMS Platform                                  | Pause rollout, inspect mixed profile/qualifier versions or corrupt evidence, and never remove final recheck; D69 stale-conflict telemetry owns live-fact drift.                      |
| `translation_copy_d70_qualification_unknown_ratio`                   |                                                                                              Greater than 2% for 30 minutes with at least 50 eligible-head checks | CMS Platform                                  | Pause cohort expansion, inspect evidence writers/migration compatibility, and retain qualified public/blank paths.                                                                   |
| `translation_copy_target_finding_projection_unavailable_age_seconds` |                                                                                                Oldest unavailable target projection over 60 seconds for 5 minutes | Web Studio + source validation owner          | Preserve the draft's current state and truthful unknown summary, repair projection/watermark, never mutate the receipt, and neither block nor satisfy D1/D66.                        |
| `translation_copy_d70_save_qualification_interference_total`         |                                                                                                                                                               Any | CMS Platform + Web Studio                     | Disable the evidence writer, keep Save authoritative, inspect synchronous coupling, and restore only after qualification is proved asynchronous and non-failing.                     |
| `translation_copy_d70_evidence_reconciliation_backlog_age_seconds`   |         Oldest retryable unknown exceeds the exact reconciliation SLO fixed in the activation release manifest for 5 minutes with at least 20 pending evaluations | CMS Platform                                  | Pause cohort expansion, preserve Save and qualified alternatives, drain/replay idempotently, and re-prove coalescing/capacity before expansion.                                      |

The existing D69 picker p95 300 ms, cross-scope disclosure, partial commit,
checkpoint retention, duplicate target, unknown outcome, and unproved publication
signals remain governing and are not duplicated.

## Ruthless synthesis and execution order

### Must be resolved before recording

Resolved in ADR-0191 and this review:

1. Define Copy Qualification independently of Save and publication validation.
2. Exhaustively classify all content/reference treatments and reject unknown/loss.
3. Use immutable revision evidence plus selected-body/live-reference final proof.
4. Keep source findings visible, non-gating, source-owned, and separate from target
   findings.
5. Preserve D69 performance/atomicity and D1/D66 publication authority without a
   new workflow, table, or scanner.

### Must enter consolidated Phase 24 OpenSpec/design before ticketing

1. D70-R1–R18 and AC1–AC30 plus accepted ADR-0192/D71 presentation.
2. D12 attachment interface, D22 retained reader/profile/manifest treatments and
   limits, accepted D32/source-finding interface, and D69 final recheck.
3. Complete resource/block/reference coverage, safe omissions/target repairs,
   exact evidence shape, compatibility, retention, and migration.
4. Trusted authorization/RLS/grants/indexes/privileged parity, issue-summary
   privacy, bounded projection, target validation, and observability.
5. Base Maia full-row/Sheet shared-primitives corrections and complete accessible
   state/failure behavior.

### Required implementation safeguards

1. Land retained readers/profiles and evidence writers without exposing candidates.
2. Prove exact-pin/provider-neutral incomplete save and all manifest/limit/
   reference/authorization negatives.
3. Prove projection performance/privacy, then final selected-body proof and D69
   atomic fault/idempotency/concurrency behavior.
4. Prove independent target findings, D1 rejection of incomplete publication,
   mixed-version migration, compatible readers, and writer-off rollback.
5. Run representative ministry-editor/a11y/weak-network tasks before bounded
   cohort activation; preserve published Copy and Start blank as fallback.

### Monitor after release

Only the twelve D70 signals above and inherited D69 signals qualify for monitor
status because each has a threshold, owner, and response. False offer, unknown
input acceptance, forbidden reference, silent omission, source-finding
inheritance, or private disclosure are zero-tolerance incidents, not accepted
residual behavior.

## Final disposition

**Accept with required amendments.** Option 1 is the modern, user-centered choice
and is more coherent with Core than publication-ready-only or a translation
handoff workflow. The accepted answer is not “copy any saved draft”: it is exact
revision-bound, lossless, scope-safe Copy Qualification with immutable compact
evidence, live/final reproof, visible non-gating source findings, independently
validated target truth, and unchanged D1/D66 publication authority.

No runtime, schema, migration, Payload/Vercel setting, Supabase policy, OpenSpec,
ticket, or deployment changed. Implementation remains gated on the named Phase
23 equivalents, D71, consolidated Phase 24 OpenSpec, exact provider/profile
coverage, and release proof.
