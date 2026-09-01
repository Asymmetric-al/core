# ADR-0191: Revision-bound Copy qualification with non-gating source findings

**Status:** Accepted (founder ruling after required amendments, Phase 24 D70 —
2026-08-30)

## Context

ADR-0190 permits one exact server-acknowledged private Working Revision to appear
as **Latest saved draft**, but deferred how complete that revision must be. The
founder selected structurally safe drafts with visible source issues so
translation can begin before unrelated publication work is finished.

That direction matches modern draft systems but “structurally safe” is too vague
unless Core owns a purpose-specific contract. Current Pages use Payload drafts
and 300 ms autosave with `drafts.validate` unspecified; current Payload therefore
permits incomplete drafts. A successful save, required TypeScript field,
`_status`, client validation, or provider error count does not prove that Core
can materialize every block, value, and reference into another exact locale
without loss or scope leakage. Current Core also has no D12 Working Revision,
D22 Localized Editorial Profile, D32 findings, D69 command, or D70 qualifier.
Phase 23 PR #1340 remains open and blocked, so those contracts are proposed
dependencies rather than current runtime truth.

Comparable products keep drafts and release validation distinct. Payload allows
incomplete drafts unless draft validation is explicitly enabled. Sanity permits
errors and warnings on drafts while errors block publication. Contentful validates
release candidates, Blackbaud lets staff copy draft forms and review validation
before publication, WordPress separates draft/autosave work from publication,
and Salesforce demonstrates both a heavyweight Ready-for-Translation workflow
and a later Enhanced CMS model that removed that prerequisite and permits export
from content in any status. Core must preserve its governing
exact-locale, source-owned validation, D67 provenance, and D1/D66 publication
boundaries rather than copy one provider's statuses.

## Decision

### Effective Copy Qualification

Every private or public D69 source head must pass one exact, purpose-specific
**Copy Qualification** before it may be an enabled Copy source. Qualification
proves only that Core can deterministically create meaningful private target
input from the exact source revision under the current compatible versioned
resource/copy profile. It is not publication readiness, validation approval,
translation quality, safety approval, review, or a workflow handoff.

Copy Qualification is an effective target/action proof with two deliberately
separate stages. Source acknowledgement may prove only static source-side
recognition, decoding, manifest treatment, limits, material effect, and the exact
reference identities that will need live checking. The chooser and final command
must compose that evidence with the exact target locale/profile, actor authority,
current lifecycle/safety/reference compatibility, and target state. Core stores no
target-, actor-, or permission-specific favorable matrix on the source revision.

For the exact revision, canonical digest, schema/profile, block/type versions,
and copy-manifest version, the source owner must prove all of the following:

1. the complete source input is recognized and readable through a retained exact
   reader;
2. every present facet, rich-text node, block, package value, and relationship
   has one deterministic manifest treatment;
3. canonicalization and target materialization remain inside declared count,
   depth, and byte limits and produce a meaningful result beyond blank-target
   defaults;
4. no value is truncated, coerced, inferred, silently dropped, substituted,
   executed, or resolved through locale fallback;
5. every value preserved as a stable reference is currently the expected type,
   exists, is lifecycle-eligible, is source-readable, remains within admitted
   scope, and is target-compatible;
6. current source/target lifecycle, Phase 10 safety, source-read, target-create,
   profile, and D69 atomic-effect requirements permit the action; and
7. qualification performs no external fetch, URL probe, provider mutation,
   public lookup, remote scanner/model call, or other side effect.

The versioned manifest must exhaustively classify recognized input as one of:

- copy the value;
- preserve a currently authorized, target-compatible stable reference;
- materialize a target-owned missing-dependency/repair condition when that
  dependency owner explicitly defines a deterministic safe target
  representation;
- omit only through an explicit, meaning-preserving safe-omission rule; or
- never copy.

Unknown, corrupt, ambiguous, unsupported, over-limit, executable, lossy,
cross-scope, unauthorized, or unclassified meaning fails closed. Nothing is
silently omitted merely to make Copy succeed. Cross-locale Reusable Section
references never carry silently. A known absent value may remain absent when the
private-target contract can represent it and its owner will derive the target's
own repair finding. If the copy result would contain no meaningful source effect,
Core offers **Start blank** rather than manufacturing Translated provenance.

### Compact evidence and final recheck

After D12 authoritatively acknowledges an exact canonical Working Revision, a
source-owned post-acknowledgement hook starts or reuses a pure, bounded evaluation
of the exact source content that emits content-free **Copy
Qualification Evidence**, without changing D12's side-
effect-dark durability semantics. Repeated acknowledgements of the same canonical
digest and contract coalesce rather than repeat work. For a legacy current D1 publication
without that attachment, the same source owner may evaluate D1's exact current
published revision only after retained-reader and canonical-digest proof. A future
D1 publication of an already-evidenced exact D12 revision reuses that evidence
identity. Evidence binds the exact revision/digest and one collision-resistant,
versioned **source-contract digest** covering the retained schema, resource/copy
profile, manifest, canonicalization, qualifier, every block/node/package version,
and every count/depth/byte limit. It records a proved
source-input-qualified or source-input-not-qualified outcome; material-effect
presence; the transferred-reference identities needed for live recheck; and at
most one bounded non-content reason class. It does not know or prove a future
target locale/profile, actor, authority, lifecycle, or reference admission and is
never full Copy Qualification by itself.

The accepted physical design must durably attach at most one immutable,
content-free completed evidence result to each complete same-scope `(source
revision, canonical digest, source-contract digest)` identity without pre-
freezing a table shape. The complete identity is
the idempotency/uniqueness key: repeating it reuses the same deterministic result,
and a changed contract version creates a distinct identity. Missing, queued,
in-progress, failed, or timed-out evaluation is **unknown**, not evidence and never
favorable. Bounded source-owner reconciliation or authorized **Check again**
idempotently requests the same identity; operational attempt/retry state stays in
the source owner's accepted durable-work mechanism, not revision evidence.

Qualification never delays or fails D12 acknowledgement. If bounded evaluation
cannot finish within the source owner's asynchronous budget, Save succeeds and
the projection reports retryable unknown for later reconciliation.
Qualification-evidence failure or unavailability never blocks Save, autosave,
undo, recovery, comparison, or Preview.

Operational evaluation work is coalesced to the useful exact-head frontier, not
merely repeated equal digests. A newer D12 Working Revision may cancel or skip
pending work for an older unretained, unprotected private revision. The exact
current D12 head, D1 current published revision, and any revision referenced by a
retained D69 Copy Source Checkpoint/Basis are never incorrectly skipped or invalidated;
private/public heads receive fair capacity. Supersession changes operational work
only and never mutates completed evidence.

This evidence is additive exact-revision metadata—not a candidate row, mutable
`copy_safe`/`is_copyable` Boolean, latest pointer, issue record, approval, or
workflow state. A declared compatibility relation may admit an older evidence
version; otherwise missing/unknown, digest-mismatched, unsupported, or
incompatible evidence is never favorable. Current live scope, authorization,
lifecycle, safety, and preserved-reference facts still re-evaluate at chooser
open and commit.

The D69 picker independently qualifies each exact private/public head by composing
evidence with the exact target locale/profile and one batched live fact query.
Only then does it deduplicate enabled qualified heads; it prefers the public row
for equal input only when that public head is also qualified, and it never hides a
qualified sibling behind an unknown or unqualified head. It does not fetch or
return candidate bodies, diffs, or history. After deliberate selection,
the trusted D69 command reads the exact selected body, verifies the digest and
every contract version, reruns complete qualification and every reference check,
and only then enters the existing atomic write. Favorable evidence cannot bypass
the final proof. The exact body never enters a public/shared/Vercel/persistent
browser cache.

### Publication findings remain visible and non-gating

Missing release-required values, incomplete editorial details, untranslated
prose, accessibility details or suggestions, review, approval, paths, SEO,
schedules, public dependencies, and D1/D66 closure do not fail Copy
Qualification merely because they can block or inform a future release. Missing
required equivalent text and questionable equivalent-text quality are different
source findings, but both remain copyable when the structural contract is
proved.

An accepted Phase 23 D32-equivalent source contract may describe **Details to
finish**, **Suggestion**, and **Technical issue**. Copy remains available for all
three classes. A Technical issue blocks Copy only when an independent D70 proof
above becomes unavailable; in that case the result is a Copy-contract failure,
not an escalation of the editorial finding. Stale or unavailable finding checks
are separately unknown and never become a favorable zero.

D70 consumes a viewer-authorized **Source Finding Summary** from the applicable
source owners. The projection binds the exact source revision/digest, current
compatible validator/rule generation, evaluated coverage watermark,
`complete | partial | unavailable` completeness, and only the finding classes the
viewer may know. An older rule generation, incomplete watermark, missing owner,
or failed check can never project a complete clear result. D70 creates no rule
catalog, issue ledger, severity mapping, assignment, notification, waiver, or
second validation surface. A finding-summary change alone is display-only and
does not change the selected source identity, Copy evidence, Basis, idempotency
meaning, or target. Source head, copy contract, lifecycle/safety, permission, or
preserved-reference change may still conflict under D69.

### Target truth

Copy creates one private target Working Revision through ADR-0190. The target
independently evaluates every copied or absent value and reference under its own
exact locale, resource/copy profile, manifest, applicable source validators, and
current finding-rule versions. Source finding rows, counts, classes, review,
approval, favorable validation, **Keep as written**, schedules, paths, and
publication evidence never transfer. Source-language content remains explicitly
subject to target-locale review.

Target structural proof occurs inside the atomic creation command. Derived
target editorial findings may resolve immediately afterward; if that projection
is unavailable, the just-created target is still the private draft the command
promised and says **Target checks are unavailable right now. Your draft is
saved and private**, never clear or ready. That projection outage neither
publishes the draft nor independently blocks a later D1/D66 proof. D1 remains the only exact publication-
candidate validator and D66 remains the bounded Site Locale publication-contract
owner. D70 never runs their compile in the chooser or turns Copy qualification
into favorable public authority.

## Authority and data invariants

- D12 owns the acknowledged Working Revision, canonical content identity, Save
  semantics, lease, checkpoints, and revision attachment boundary.
- The D22/resource owner owns the retained exact reader and versioned finite
  localization/copy profile and manifest.
- D32 and other source validators own current contextual findings.
- D70 owns only Copy Qualification semantics and truthful finding-summary use.
- D69 owns candidate projection and the atomic private-target start command.
- D67 owns provenance, Basis, comparison, and the public-source publication
  boundary.
- D1/D66 own exact publication validation and favorable public generation.
- D31 may project verified operational regressions but never qualifies Copy.
- Payload is a replaceable persistence/authoring adapter only.

D70 creates no standalone candidate/status table, Site setting, target/source matrix,
candidate materialization, mutable status, issue ledger, workflow, task,
approval, or Phase 12 capability. The accepted source-owner design must durably
attach the unique immutable completed evidence result to the exact source
revision/checkpoint and preserve it through restrictive deletion and the retained-
reader lifecycle. Its scope, revision, digest, versions, complete evidence identity, outcome,
material-effect fact, reference identities, and safe reason class come from
trusted server logic, never caller input. Same-scope relationships and structural
uniqueness make duplicate or contradictory completed proof impossible.

Evidence follows the source owner's accepted D12 retention and legal-erasure
contract. It retains only the reference identities strictly necessary while the
candidate or D69 checkpoint evidence remains live. Source/reference erasure,
revocation, or lifecycle loss makes future effective qualification unavailable,
cannot leave a dangling FK or reusable favorable result, and reveals no erased
identity. Any D69 historical tombstone remains minimum content-free provenance
and can never reauthorize Copy.

All existing D69 complete-scope relationships, uniqueness, minimum grants,
applicable ENABLE/FORCE RLS, operation-correct `USING`/`WITH CHECK`, security-
invoker views, hardened functions, indexed predicates, and direct-DML/service/
Payload/worker/importer/AI poison tests continue to apply. Public, unauthorized,
or cross-scope readers cannot distinguish evidence, finding presence/count,
unavailable reason, source content, or target consequences. Actor-scoped
Payload calls use authenticated context and `overrideAccess:false`.

## Staff experience

The existing D69 **Copy into French (Canada)** Sheet and one unselected
RadioGroup remain. A qualified private row keeps its source identity, private/
published state, and absolute saved time. When source findings are known, its
associated description uses the source owner's ordinary vocabulary:

- **Has details to finish**
- **Has suggestions**
- **Has details to finish and suggestions**
- **Technical issue** when an authorized, source-owned Technical issue summary
  is applicable

When coverage is partial, Core retains the known summary and adds **Some source
editing checks are unavailable**. When all checks are unavailable, it says
**Source editing checks are unavailable**. It never turns missing evidence into
zero, green, **No issues**, **Passed**, **Ready**, or **Ready to publish**.

Every qualified issue/unknown state explains: **You can still copy this source
version. The new French (Canada) draft will be checked separately.** Finding
loading or failure does not hold a separately qualified candidate hostage.

The full 44-pixel-minimum radio row contains locale, version kind, public/private
state, timestamp, and compact summary. The radio's accessible name carries
locale/version/state; finding text and time use stable associated descriptions
without duplicative narration. No link, button, disclosure, or issue detail is
nested inside the row label. Optional detail after selection uses a separate
Base UI Collapsible below the RadioGroup, preserves selection/focus, and shows
category-level explanation only. An independently authorized, source-owner/head-
accurate handoff may route to the owning surface—for example **Open source draft**
for a private head or **Open source editor** for an immutable public head; D70
creates no issue viewer and the handoff is never required to Copy. ADR-0192/D71
renders an authorized structurally unqualified source head in a separate visible
ordinary list; it is never a disabled radio.

After creation, the target editor focuses its heading, retains ADR-0190's
immutable source receipt, shows **Copied content needs review in French
(Canada)** as calm target editorial context, derives its own finding summary,
and separately shows ADR-0190's private-source publication blocker when
applicable. It never repeats source findings as target truth.

If target finding projection is unavailable, one composed readiness region says
**Target checks are unavailable right now. Your draft is saved and private.**
An authorized, bounded **Check again** retries only that owner projection. The
region also retains any independent D67 source-publication blocker and action;
neither condition hides, clears, or impersonates the other.

Candidate qualification loading uses one polite status and `aria-busy` on the
candidate result region. A later non-gating finding refresh scopes `aria-busy`
and status to the finding-summary subregion so the RadioGroup remains operable.
Finding unavailability is persistent text, not an alert. Structural
qualification loss, authorization loss, or proved submission failure uses one
focus-linked alert. Finding refresh never moves focus or announces every row.
Offline selection is preserved but submission stays disabled until reconnect and
fresh proof; no offline queue is introduced.

Implementation must compose the complete row as the 44-pixel target, make the
shared Sheet's close action meet the same target convention, explicitly use a
full-width single-column mobile Sheet with `min-h-0` scroll body and safe-area-
aware reachable footer, and prohibit line clamp/truncation for essential locale,
state, finding, time, or recovery text. It fixes shared primitives when their
contract is deficient rather than forking an app-local control. DOM, visual,
keyboard, and screen-reader order agree and the journey passes keyboard, screen
reader, touch, forced colors, reduced motion, 320 CSS pixel/400% reflow, long/
CJK/RTL/bidi, weak-network, and JavaScript-failure proof.

## Failure, performance, migration, and rollout

An unknown qualifier is not an empty/healthy finding set. A qualification
outage fails only the affected source head closed while Start blank and every
independently qualified version/locale remain. Proved source-input-not-qualified
and unknown are distinct: the first may expose a bounded safe cause; the
second says availability could not be checked and permits bounded source-owner
reconciliation/Check again. Source-edit repair is offered only for a source-
repairable cause and an authorized actor; platform/profile causes remain platform-
owned. Unauthorized viewers learn neither state. A finding-summary outage
fails open for Copy only when qualification remains proved and says that checks
are unavailable. If final recheck fails, Core creates nothing and says **This
saved source can no longer be copied. Refresh the list or choose another
version. Nothing was created.** Unknown command outcome continues ADR-0190's
receipt reconciliation.

Qualification evidence and live facts must stay inside D69's existing p95 300 ms
metadata budget without body/history N+1, remote work, or shared private caching.
Source-side evaluation is pure, bounded, coalesced by canonical digest/contract,
and asynchronous to D12 acknowledgement; it must not consume D12's save-latency
budget or turn qualification failure into save failure. Complete selected-body
work occurs only for the selected command. Finding detail is lazy and does not
reload source bodies or clear selection.

Migration never infers qualification from Payload `_status`, required fields,
generated TypeScript, validation success, time, autosave flags, or version order.
It may attach evidence only after a retained exact reader evaluates an explicitly
proved D12 Working Revision/digest or D1 exact current published revision/digest
under a supported copy contract. No withdrawn/prior publication, arbitrary
history, or provider latest may substitute. Unknown legacy content remains
unavailable; Start blank and other qualified heads remain.
Mixed-version rollout lands retained readers/evidence writers and target
validators, proves the command recheck, then exposes candidates. Killing private
Copy preserves all ADR-0190 readers, targets, findings, checkpoints, Bases,
receipts, blockers, and D67 remediation; rollback remains writer-off/roll-forward.

Activation requires accepted D12/D22/D32-equivalent contracts, D67-D71,
consolidated Phase 24 OpenSpec, installed-Payload-pin and
provider-neutral conformance, hostile-scope/reference/fault/migration/performance
proof, and representative ministry-editor usability/accessibility evidence.

## Consequences

- Editors keep useful incomplete work and parallel localization without a new
  readiness ceremony.
- Copy is safer than “saved successfully” because unknown content and references
  cannot silently cross locale/scope.
- Source findings stay visible without becoming target truth or Copy blockers.
- One small immutable revision attachment avoids eager picker scans and provider
  coupling.
- The strongest fallback remains published Copy plus Start blank whenever exact
  qualification cannot be proved.

## Rejected alternatives

- **Publication-ready drafts only:** duplicates D1/source release rules, serializes
  translation, and weakens the reason for private Copy.
- **Ready for translation state:** adds ceremony, locking, permissions, and stale
  workflow facts without proved tenant need.
- **Payload validation as qualification:** conflates save/publication/copy,
  provider semantics, and client/server paths.
- **Eagerly scan every candidate body on open:** violates D69's bounded picker and
  weak-network experience.
- **Trust evidence without final body/reference recheck:** lets corrupt, stale, or
  forged evidence create a target.
- **Copy source finding rows:** creates false target truth and a second issue
  system.

## References

- [ADR-0190 — Two exact Copy source heads](./0190-two-head-copy-sources-and-immutable-draft-checkpoints.md)
- [Phase 24 D70 adversarial review](../prds/sitestacker-parity/phase-24-d70-revision-bound-copy-qualification-adversarial-review.md)
- [Payload Drafts](https://payloadcms.com/docs/versions/drafts)
- [Payload Fields and validation](https://payloadcms.com/docs/fields/overview)
- [Sanity validation](https://www.sanity.io/docs/studio/validation)
- [Sanity schema validation and the Content Lake](https://www.sanity.io/docs/content-lake/schema-validation-and-the-content-lake)
- [Contentful validations](https://www.contentful.com/help/fields/available-validations/)
- [Blackbaud draft-form Copy and Preview](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/grantmaking/content/gc-forms-manage-draft-forms.html)
- [Drupal content moderation](https://www.drupal.org/docs/8/core/modules/content-moderation/overview)
- [Salesforce CMS translation lifecycle](https://help.salesforce.com/s/articleView?id=sf.cms_translation_content.htm&language=en_US&type=5)
- [Salesforce Enhanced CMS translation lifecycle simplification](https://help.salesforce.com/s/articleView?id=release-notes.rn_experiences_enhanced_cms_translationlifecycle.htm&language=en_US&release=240&type=5)
- [WordPress revisions](https://wordpress.org/documentation/article/revisions/)
- [W3C error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification)
- [WAI form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
