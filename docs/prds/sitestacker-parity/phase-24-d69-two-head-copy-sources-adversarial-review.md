# Phase 24 D69 — Two exact Copy source heads adversarial review

**Date:** 2026-08-30  
**Founder answer:** Option 1 — latest saved draft plus current published version.  
**Final disposition:** **Accept with required amendments.**  
**Decision authority:** [ADR-0190](../../adr/0190-two-head-copy-sources-and-immutable-draft-checkpoints.md)

## Decision under review

The founder chose the best product direction: when an eligible source locale has
newer saved work, staff may start a target translation from that work instead of
waiting for an early source publication; they may also choose the version that
visitors currently receive. The strongest alternative, published-only Copy, is
safer by construction but serializes localization and can pressure staff to
publish unfinished source content.

The short answer was not implementation-safe. “Latest saved draft” could mean a
browser buffer, a debounced or outcome-unknown save, Payload's moving `draft:
true` alias, a coalesced autosave row that retention later removes, an arbitrary
version-history item, or a scheduled release. It also left ambiguous whether a
target copied from private source meaning could become public before that source
meaning was itself authoritative.

The corrected decision exposes at most two **distinct logical heads** for each
D68-eligible source locale:

1. **Latest saved draft** — exactly Core's current server-acknowledged D12
   Working Revision, when distinct and qualified under ADR-0191's accepted D70
   contract.
2. **Current published version** — exactly the immutable source revision selected
   by D1's current authorized public generation, when qualified under the same
   ADR-0191 contract.

Core never preselects either. A private selection is frozen into an immutable,
retention-protected **Copy Source Checkpoint** before it becomes D67 Translation
Basis evidence. Copy creates one private target or nothing. A target based only
on private source evidence cannot first publish as Translated until D1's current
authoritative source publication pins the same exact source revision represented
by the checkpoint under the same compatible copy-manifest/canonicalization
identity, or D67 creates a reviewed successor Basis against the actual current
publication. D69 adds no version
browser, Site setting, workflow, public fallback, or second resolver.

## Current behavior, intended behavior, and permanent path

| Layer               | Verified current `develop` behavior                                                                                                                                      | Intended D69 behavior                                                                                                                               | Best permanent path                                                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web Studio          | Payload Pages have drafts, a 300 ms autosave, and Save Draft; current UI can say Private draft, Draft ahead, or Published. There is no exact-locale Copy source chooser. | One Base Maia Sheet shows at most two distinct, exact source heads per eligible locale and starts unselected.                                       | Add one purpose-shaped projection and one resource-owned start command after accepted D1/D12/D22 equivalents; do not infer product heads from provider status. |
| Private source head | Current code has no accepted D12 Working Revision or authoritative acknowledgement contract.                                                                             | Latest saved draft means the exact current server-acknowledged Working Revision, not a provider query.                                              | Let D12 remain the sole owner of working head, acknowledgement, checkpoints, lease, and retention.                                                             |
| Public source head  | Current public reader can read published Payload content but has no D1 exact Site Locale generation/source-revision contract.                                            | Current published version means the exact source revision pinned by the current favorable public generation.                                        | Let D1/Public Site Generation remain the sole public-head authority.                                                                                           |
| Versions/provenance | Payload version rows and autosave exist; Core has no D67 Basis or private-source checkpoint.                                                                             | A selected private head is frozen/reused as immutable evidence; target revision pins it exactly.                                                    | Use a source-owned meaningful checkpoint, never a rolling autosave row or mutable `is_latest` pointer.                                                         |
| Target creation     | No D69 command exists.                                                                                                                                                   | One exact, authorized, compare-and-swap command creates the checkpoint if needed, private target, provenance, Basis, audit, and receipt atomically. | Keep one resource-domain mutation boundary; private Copy remains off if the accepted storage owners cannot prove atomicity.                                    |
| Public behavior     | Current runtime has no D69 candidate input. D66 rejects cross-locale fallback.                                                                                           | D69 has no public read, route, cache, Vercel, Giving, currency, Stripe, or message effect.                                                          | Preserve the public-generation boundary and D67 publication gate; never let a private candidate become a public resolver.                                      |
| Authorization       | No D69 permission exists; proposed Phase 12 separates locale management, content access, and publication.                                                                | Candidate existence and content require exact source read; creation requires exact target create/write; the command reauthorizes both.              | Reuse accepted resource capabilities with trusted server scope. D68 rank, Payload access, visibility, and caller fields grant nothing.                         |
| Formal status       | Phase 23 PR #1340 is open and blocked; merged OpenSpec contains no D66–D69 contract.                                                                                     | D69 remains a groomed target decision.                                                                                                              | Land a consolidated Phase 24 OpenSpec delta and dependency proof before design, tickets, schema, or runtime work.                                              |

## Evidence classification

### Verified repository facts

- `apps/admin/src/cms/collections/pages.ts` enables drafts and 300 ms autosave and
  displays a Save Draft action, but defines no Payload localization.
- Current Web Studio editor state distinguishes private/published conditions but
  has no D69 source-head projection or chooser.
- `apps/admin/payload-types.ts` currently represents locale and fallback locale as
  `null`; there is no implemented exact-locale lineage.
- Current public CMS reads use Tenant and provider publication status, not an
  exact D1 Site Locale generation/source revision.
- ADR-0187 requires exact-locale public publication and forbids field/resource
  fallback. ADR-0188 makes Translation Basis explicit and lets only a current
  authoritative source publication drive freshness. ADR-0189 makes source order
  staff-only and the choice explicit.
- Proposed Phase 23 ADR-0156 defines one private server-acknowledged Working
  Revision, compare-and-swap acknowledgements, rolling recovery autosave, and
  immutable meaningful checkpoints. Proposed ADR-0166 requires explicit blank or
  exact-source starts. They are dependencies, not merged runtime facts.
- Core's current one-environment-per-Supabase-project boundary means D69 must not
  invent a partially populated environment column.

### Verified primary external evidence

| Source                                                                                                                                                                                                                                                                                                                                                                                                  | Verified practice                                                                                                                                                                       | D69 use                                                                                                                        | Boundary retained                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| [Payload Drafts](https://payloadcms.com/docs/versions/drafts)                                                                                                                                                                                                                                                                                                                                           | `draft: true` returns the latest versions-row representation and can return published content when no newer draft exists; draft operations may bypass normal required-field validation. | Proves provider “latest draft” and publication readiness are not safe D69 authority.                                           | Core qualifies its own acknowledged logical head and delegates copy eligibility to D70.                                      |
| [Payload Versions](https://payloadcms.com/docs/versions/overview)                                                                                                                                                                                                                                                                                                                                       | Versions have exact identities, configured retention, and separate version-read access.                                                                                                 | Supports exact pinning and explicit retention/access proof.                                                                    | Core does not expose raw history or grant generic `readVersions`.                                                            |
| [Payload Autosave](https://payloadcms.com/docs/versions/autosave)                                                                                                                                                                                                                                                                                                                                       | Autosave is recovery-oriented, can be debounced, and can reuse the most recent autosave version.                                                                                        | Proves a rolling autosave row is not immutable Basis evidence.                                                                 | Freeze/reuse one source-owned immutable checkpoint only after selection.                                                     |
| [Payload Local API access](https://payloadcms.com/docs/local-api/access-control)                                                                                                                                                                                                                                                                                                                        | Local API access can be overridden unless the caller supplies authenticated context and disables override.                                                                              | Requires actor context, exact version access, and `overrideAccess: false`.                                                     | Core authorization remains the product PDP; provider access is never enough.                                                 |
| [Sanity Drafts](https://www.sanity.io/docs/content-lake/drafts) and [Perspectives](https://www.sanity.io/docs/content-lake/perspectives)                                                                                                                                                                                                                                                                | Private draft and published perspectives are distinct, and draft content is excluded from public/CDN reads.                                                                             | Supports the two-head mental model and private-cache boundary.                                                                 | Core does not import Sanity IDs, release semantics, or implicit perspective selection.                                       |
| [Contentful locale-based publishing](https://www.contentful.com/help/localization/locale-based-publishing/) and [versioning](https://www.contentful.com/help/faq/versioning/)                                                                                                                                                                                                                           | Locale work and publication can proceed asynchronously, while the current version and version history are different concepts.                                                           | Supports parallel localization without an arbitrary-history picker.                                                            | Core keeps exact public authorization and D67 provenance rather than provider locale status.                                 |
| [Salesforce CMS version history](https://help.salesforce.com/s/articleView?id=sf.cms_content_versionhistory.htm&language=en_US&type=5) and [Blackbaud active-page guidance](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/lo/content/content_pagebuilder2_pages_editing_content_active_page.html)                                                                                          | Comparable CMS tools distinguish the active/published version from a copy/draft used for editing.                                                                                       | Supports plain staff labels for the two meaningful heads.                                                                      | Neither product proves Core's tenant, Basis, or publication rules; those stay repository-owned.                              |
| [WAI grouping controls](https://www.w3.org/WAI/tutorials/forms/grouping/), [Radio Group Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/), [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), and [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) | A mutually exclusive choice needs a named group, predictable keyboard behavior, non-color state, appropriate status announcements, reachable targets, and zoom/reflow support.          | Drives one unselected radio group, explicit descriptions, focus recovery, 44 px primary rows, and mobile single-column layout. | Core uses Base Maia/Base UI components and tests actual assistive-technology behavior; an APG example is not copied blindly. |
| [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) and [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)                                                                                                                                                                                                                        | Grants and RLS are separate; update protection needs old/new-row policy; structural constraints prevent invalid relationships.                                                          | Requires minimum grants, `USING` plus `WITH CHECK`, complete scoped relationships, and direct-DML poison tests.                | RLS is defense in depth; trusted server authorization and one command own the effect.                                        |

### Reasonable inferences

- Ministries coordinating multilingual launches benefit from starting translation
  before the source is public; no quantitative prevalence claim is made.
- A source locale normally has zero, one, or two meaningful current heads, so a
  bounded choice is clearer than version history.
- A saved draft may be actively edited after Copy; exact checkpointing is more
  truthful than pretending Copy follows the moving draft.

### Product judgments

- “Latest saved draft” is the clearest staff label; “Working Revision” remains
  the glossary/domain term rather than UI jargon.
- Nothing should be preselected because private and public versions carry
  materially different meaning, even when only one candidate exists.
- Staff need one deliberate choice and one create action, not an additional
  confirmation dialog.
- The durable complexity belongs at the server mutation boundary, not in a Site
  policy, visible workflow, or administrator-maintained version inventory.

### Assumptions and release evidence still required

- ADR-0191 now defines D70 Copy Qualification independently of acknowledgement
  and publication readiness. Physical implementation remains gated on its
  accepted D12/D22/D32 owner interfaces and ADR-0192/D71 presentation.
- Accepted physical D1/D12/D22 owners do not yet exist on `develop`. The design
  must prove their exact identities and interfaces. D1 supplies a checked public-
  head read and is not part of the private Copy write transaction; the accepted
  checkpoint/target/Basis/audit/receipt owners must prove their shared atomic
  storage boundary before the private lane is enabled.
- The installed Payload pin must be conformance-tested for version identity,
  autosave coalescing, retention, access, and restore behavior; documentation
  alone is not release evidence.
- Representative ministry editors must prove the labels, helpers, and source
  choice are understood without training, including on mobile and weak networks.
- Candidate counts and latency are unmeasured. The release budgets below are
  product gates, not claims about current production performance.

## Ruthless category review

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes.** **What could go wrong:** Core could build private-draft
Copy before proving that parallel localization is common, while published-only
Copy already solves the correctness problem. **Why it matters:** an unneeded
private lane adds retention, authorization, and provenance obligations. **Severity:
Medium. Likelihood: Medium.** Contentful and comparable CMS products support
asynchronous locale work, but no Core tenant evidence quantifies demand.
**Decision effect:** narrows rather than invalidates Option 1. **Permanent fix:**
keep published-only as the safe degradation/kill-switch state, implement no Site
policy, and require representative task evidence before private-lane activation.
**Exact spec language:** D69-R1, R6, R18; AC2–AC6, AC28, AC30.

### 2. Brittleness

**Material concern: Yes.** **What could go wrong:** “latest” could depend on row
order, timestamp, `_status`, autosave flags, or a provider alias that changes as
Payload changes. **Why it matters:** staff could copy different content than the
row they chose, and historical Basis could disappear. **Severity: High.
Likelihood: High** without a Core logical-head contract; Payload explicitly
coalesces autosaves and `draft: true` is not a distinct-private proof. **Decision
effect:** changes Option 1 from provider latest to exact D12/D1 heads.
**Permanent fix:** exact immutable identities, deduplication by versioned copy
input, checkpointing, and provider-neutral contract tests. **Exact spec
language:** D69-R1–R4, R9, R18; AC4–AC10, AC20, AC29.

### 3. Technical debt

**Material concern: Yes.** **What could go wrong:** a D69 candidate table,
`is_latest` Boolean, generic versions API, Site setting, or second checkpoint
store could duplicate D1/D12/D67 ownership. **Why it matters:** dual truth and
provider coupling make future Payload/schema upgrades costly. **Severity: High.
Likelihood: Medium-high.** Current foundations already assign each fact to a
different owner. **Decision effect:** substantially narrows implementation while
preserving the two-head UX. **Permanent fix:** derive one purpose-shaped
projection from authoritative owners and add only the minimum source-owned
immutable checkpoint evidence. **Exact spec language:** D69-R1, R6, R9, R17–R18;
AC5, AC20, AC27–AC30.

### 4. Edge cases

**Material concern: Yes.** **What could go wrong:** never-published sources,
published-only sources, identical heads, unsaved editor text, unresolved saves,
active editing, schedules, restored history, retired locales, vanished
candidates, an existing target, or an unknown create result can mislead or
duplicate work. **Why it matters:** users may infer public status, lose time, or
create inconsistent targets. **Severity: High. Likelihood: High** in ordinary
collaborative editing. **Decision effect:** adds explicit bounded states and
recovery copy. **Permanent fix:** zero/one/two distinct candidate semantics,
truthful helper text, CAS refresh, unique target creation, and receipt lookup
before retry. **Exact spec language:** D69-R2–R5, R8, R13, R16; AC1–AC10,
AC14–AC18, AC26.

### 5. Footguns

**Material concern: Yes.** **What could go wrong:** preselecting the private row,
calling it “recommended,” copying on row click, silently advancing to a new head,
or allowing Copy over an existing draft makes accidental content/provenance
changes easy. **Why it matters:** the private/public choice changes meaning and
later publication eligibility. **Severity: Critical. Likelihood: Medium** in a
convenience-led interface. **Decision effect:** requires unselected radios, one
explicit create action, no silent substitution, and no overwrite. **Permanent
fix:** action-specific copy, disabled submit until choice, exact stale conflict,
and structural target uniqueness. **Exact spec language:** D69-R4–R5, R8, R13,
R16; AC4–AC5, AC14–AC16, AC25–AC26.

### 6. Tenant safety

**Material concern: Yes.** **What could go wrong:** a broad version query, missing
scope key, shared cache, or caller-supplied locale/revision could reveal or copy
another Tenant/Site's private content. **Why it matters:** this is a direct
cross-tenant confidentiality breach. **Severity: Critical. Likelihood: Medium**
unless scope is structural and rechecked at effect time. **Decision effect:**
adds non-enumerating projection, complete scoped identities, no shared cache,
and command reauthorization. **Permanent fix:** trusted Tenant/Site/resource/
locale context, same-scope constraints, actor-shaped reads, and negative tenant/
site poison tests. **Exact spec language:** D69-R7–R8, R14, R17; AC11–AC13,
AC19, AC27.

### 7. Database, RLS, and authorization safety

**Material concern: Yes.** **What could go wrong:** nullable scope, unscoped FKs,
cascade pruning, a mutable source pointer, broad `readVersions`, absent
`WITH CHECK`, a service-role shortcut, or a partially committed target/Basis can
manufacture authorized-looking history. **Why it matters:** an allowed update
could move a row into forbidden scope or destroy the evidence required to
interpret public content. **Severity: Critical. Likelihood: High** without an
explicit command/data contract. Supabase separates grants from RLS, and
PostgreSQL constraints must carry the invariant. **Decision effect:** adds
database safeguards but does not freeze table names prematurely. **Permanent
fix:** non-null complete scope, immutable exact revisions/digests, composite
same-scope relationships, unique target/Basis rules, restrictive deletion,
purpose indexes, minimum grants, applicable ENABLE/FORCE RLS, operation-specific
`USING`/`WITH CHECK`, security-invoker views, hardened functions, trusted actor/
time, and direct-DML/service/Payload-bypass poison tests. No money, storage, or
generated-document field is introduced. **Exact spec language:** D69-R8–R10,
R13–R14; AC11–AC21.

### 8. Overengineering

**Material concern: Yes.** **What could go wrong:** arbitrary history, release
pickers, per-Site policies, diff engines, approval gates, workflows, tasks,
notifications, or compensating sagas could grow around a two-choice action.
**Why it matters:** occasional editors face more decisions while Core owns more
state and recovery machinery. **Severity: High. Likelihood: Medium.** The former
ambiguity invites a generic version browser. **Decision effect:** rejects those
extensions. **Permanent fix:** at most two heads, optional reuse of D12 compare,
one atomic command, and published-only fail-closed behavior if atomic private
Copy is unavailable. **Exact spec language:** D69-R1, R6, R10, R16–R18; AC1–AC6,
AC19, AC28.

### 9. UX/UI and user friction

**Material concern: Yes.** **What could go wrong:** provider jargon, a table,
relative-only dates, unclear private/public status, nested overlays, eager diff,
or inaccessible grouped radios make a small choice hard on mobile and with
assistive technology. **Why it matters:** staff need to understand what will be
copied and what visitors see in seconds. **Severity: High. Likelihood: High.**
WAI guidance supports one named mutually exclusive group, associated
descriptions, status handling, target size, and reflow. **Decision effect:**
keeps Option 1 but replaces its vague labels/flow with the ADR-0190 Sheet.
**Permanent fix:** one Base Maia Sheet and RadioGroup, full locale identity,
absolute localized time plus timezone, explicit Not public/Published wording,
no preselection, one create action, persistent success receipt, deterministic
focus, and mobile/RTL/zoom/weak-network proof. **Exact spec language:** D69-R5,
R16–R17; AC4–AC6, AC25–AC27, AC30.

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes.** **What could go wrong:** Payload draft status, D12
working head, D1 public head, D67 Basis, and the D69 picker could all claim
authority over “the source version.” **Why it matters:** a moving read model may
become write/public authority and history loses meaning. **Severity: Critical.
Likelihood: High** if the domain vocabulary remains loose. **Decision effect:**
changes Option 1 into a projection of disjoint owners. **Permanent fix:** D12
owns private head/checkpoints, D1 owns public head, resource manifest owns copied
shape, D69 owns only projection/start consequence, D67 owns Basis/freshness, and
Public Site Generation alone owns serving. **Exact spec language:** D69-R1–R3,
R6, R9–R12, R15; AC4–AC6, AC20–AC24, AC29.

### 11. Hidden coupling

**Material concern: Yes.** **What could go wrong:** binding D69 to Payload
`_status`, autosave row layout, Web Studio state labels, Vercel cache behavior,
or D68 order can make provider/UI changes alter provenance. **Why it matters:**
an adapter upgrade could silently change eligible content or public meaning.
**Severity: High. Likelihood: High** because those seams already exist and are
tempting shortcuts. **Decision effect:** requires provider-neutral logical heads
and explicit isolation. **Permanent fix:** adapter contracts and conformance
tests; no D68/Public/Vercel input to authority; no provider metadata in Basis.
**Exact spec language:** D69-R1–R3, R6–R7, R15, R17–R18; AC11, AC27–AC30.

### 12. Failure modes

**Material concern: Yes.** **What could go wrong:** metadata load fails, access or
head changes after display, the target wins a race, transaction acknowledgement
is lost, or only checkpoint/target/Basis/receipt commits. **Why it matters:**
staff may retry into duplication or believe a private draft exists when evidence
does not. **Severity: High. Likelihood: Medium-high** over real networks and
collaborative sessions. **Decision effect:** adds truthful, effect-specific
failure states and atomicity. **Permanent fix:** no offline queue, no remote call
under locks, stale conflicts that create nothing, semantic receipt replay,
unknown-outcome reconciliation, and all-or-none commit. **Exact spec language:**
D69-R8, R10, R13, R16–R17; AC14–AC19, AC26–AC27.

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes.** **What could go wrong:** two editors start the same
target, a source changes between view and commit, an autosave is coalesced, a
publication advances, or the same request arrives twice. **Why it matters:** two
individually valid actions can jointly violate the one-target/one-Basis
invariant. **Severity: Critical. Likelihood: High** in collaborative Web Studio.
**Decision effect:** requires exact expected heads, unique winner, immutable
checkpoint, deterministic lock order, and business-effect idempotency.
**Permanent fix:** one command with semantic key and meaning, compare-and-swap
heads, unique target constraint, same-key replay, changed-meaning conflict, and
successor-only correction. **Exact spec language:** D69-R2, R8–R10, R13–R14;
AC7–AC10, AC14–AC21.

### 14. Data integrity risks

**Material concern: Yes.** **What could go wrong:** duplicate candidates,
duplicate targets, mutable/dangling Basis, mismatched canonicalization profile,
pruned checkpoints, or partial migration inference creates false Current
translations. **Why it matters:** reporting and future publication can no longer
explain what content was reviewed. **Severity: Critical. Likelihood: Medium-high**
without structural invariants and retention. **Decision effect:** adds exact
identity, dedupe, restrictive evidence lifecycle, and no-backfill rule.
**Permanent fix:** unique logical heads/target/Basis, versioned copy manifest and
canonicalization digest, immutable retention/tombstone contract, atomic commit,
and no inference from historical provider rows. **Exact spec language:**
D69-R1–R4, R9–R14, R18; AC4–AC5, AC19–AC24, AC28–AC29.

### 15. Security and privacy risks

**Material concern: Yes.** **What could go wrong:** the existence, timestamp,
author, title, body, error detail, log, diff, browser cache, or shared CDN entry
for a private source can disclose planned ministry work; copied content may also
include unapproved sensitive fields. **Why it matters:** missionary/member-care,
location, launch, or personnel information can be highly sensitive. **Severity:
Critical. Likelihood: High** if generic version/history APIs are reused.
**Decision effect:** requires data minimization and purpose-shaped authorization.
**Permanent fix:** omit unauthorized candidates non-enumeratively, hide author by
default, load body/diff only after exact authorization, copy only manifest
fields/references, use `no-store`, redact logs/audit, preserve retention/legal-
erasure evidence rules, and prohibit exports/provider metadata. **Exact spec
language:** D69-R5, R7, R9, R11, R14, R17; AC11–AC13, AC20–AC21, AC27.

### 16. Scalability and performance risks

**Material concern: Yes.** **What could go wrong:** one versions query, body read,
or diff per locale causes N+1 latency and memory growth; shared caching then
risks privacy. **Why it matters:** larger multilingual Sites and weak field
networks would make the chooser unusable. **Severity: Medium-high. Likelihood:
Medium.** Site Locale cardinality is not measured, so claims must be release-
tested. **Decision effect:** bounds reads rather than adding cache complexity.
**Permanent fix:** one preference read plus one batched metadata/eligibility
query, no eager body/history/diff, indexed predicates, private no-store response,
and a measured p95 gate. **Exact spec language:** D69-R7, R17–R18; AC27, AC29–AC30.

### 17. Operational burden

**Material concern: Yes.** **What could go wrong:** mutable autosaves referenced
forever, orphan repair, manual SQL, version cleanup exceptions, or per-Site
policy support can require recurring developer intervention. **Why it matters:**
small ministry teams and Core operations need deterministic self-service
recovery. **Severity: High. Likelihood: Medium.** Private provenance necessarily
adds retention unless carefully bounded. **Decision effect:** permits exactly
one minimum checkpoint obligation and no generic repair workflow. **Permanent
fix:** create/reuse a meaningful immutable checkpoint only when selected,
atomically link it, expose receipt-based recovery, retain/tombstone by owner, and
support private-lane kill switch. **Exact spec language:** D69-R6, R9–R10,
R13, R18; AC17–AC20, AC28.

### 18. Observability and auditability gaps

**Material concern: Yes.** **What could go wrong:** technical logs alone cannot
prove what exact source staff chose, whether the target was created, why
publication is blocked, or whether a retry was duplicate. **Why it matters:**
staff and operators need durable business history without exposing content.
**Severity: High. Likelihood: Medium.** The command spans multiple authoritative
facts and an ambiguous response is realistic. **Decision effect:** adds a
content-free audit/receipt and named monitors. **Permanent fix:** record trusted
actor/time/scope, candidate kind, immutable identities/digests, command/result,
and idempotency evidence; keep content out of logs; surface persistent target
receipt; monitor impossible states. **Exact spec language:** D69-R8–R10, R13,
R16, R18; AC17–AC20, AC26, monitors below.

### 19. Dependency and integration risks

**Material concern: Yes.** **What could go wrong:** Payload version semantics,
retention, access, restore, or upgrades can contradict Core heads; Vercel/shared
cache can expose private metadata; the checkpoint/target/Basis/audit/receipt
owners may not share an atomic write boundary. **Why it matters:** provider
disagreement could corrupt provenance or force a saga. **Severity: High.
Likelihood: Medium-high.** Current Payload is a
pinned internal build and Phase 23 foundations are unmerged. **Decision effect:**
makes private activation conditional and keeps Vercel outside the flow.
**Permanent fix:** exact-pin and provider-neutral conformance tests, actor-scoped
Local API with `overrideAccess:false`, no network under transaction, no shared
cache, atomic-owner proof, and published-only degradation. **Exact spec language:**
D69-R7, R9–R10, R15, R17–R18; AC11, AC19–AC20, AC27–AC30.

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes.** **What could go wrong:** backfilling private heads from
provider timestamps/status/history, enabling UI before checkpoint/atomic proof,
or rolling back by deleting evidence can create false candidates and dangling
Bases. **Why it matters:** mixed-version deployments may write states old code
cannot preserve or interpret. **Severity: Critical. Likelihood: Certain** if a
naive backfill is attempted because current data lacks D12/D1 identities.
**Decision effect:** forbids inference and requires staged activation.
**Permanent fix:** expand readers/degradation first; enable published lane; prove
private checkpoint/atomic path; cohort-enable private lane; kill only new private
offers; preserve all evidence on rollback; roll forward rather than rewrite.
**Exact spec language:** D69-R18; AC28–AC30.

### 21. Testability, traceability, and proof

**Material concern: Yes.** **What could go wrong:** “show latest draft and
published” can pass a UI snapshot while choosing the wrong row, leaking another
Tenant, committing partially, or publishing from private proof. **Why it
matters:** implementation detail tests would not prove user/domain outcomes.
**Severity: High. Likelihood: High** without exact requirements and public-seam
tests. **Decision effect:** requires falsifiable requirements, acceptance suite,
and artifact traceability. **Permanent fix:** D69-R1–R18 and AC1–AC30 must trace
through Grill answer, glossary, ADR, OpenSpec, design, tickets, code, tests, and
release evidence, including positive/negative/boundary/auth/concurrency/
migration/accessibility/production-shaped cases. **Exact spec language:**
D69-R18; AC1–AC30.

### 22. Other development hazards

**Material concern: Yes.** **What could go wrong:** implementing from this ADR
before accepted D1/D12/D22/D32 equivalents, ADR-0191/D71, treating “Accepted” as
merged OpenSpec authority, or
silently importing unmerged Phase 23 shapes can produce dead code and ADR
conflict. A UI-search helper was also unavailable locally, so styling claims
could outpace repo proof. **Why it matters:** premature certainty creates
rework and false release confidence. **Severity: High. Likelihood: High** in a
long grooming sequence. **Decision effect:** keeps D69 documentation-only and
records explicit dependency/evidence gates. **Permanent fix:** consolidate the
Phase 24 delta only after dependencies are reconciled; use installed Base Maia
components and production usability/accessibility proof; do not ticket or
implement from the decision log alone. **Exact spec language:** D69-R16, R18;
AC25, AC29–AC30.

## Exact normative requirements

### D69-R1 — Bounded logical heads

For every source locale already eligible for the exact D68 action/viewer, Core
MUST project zero, one, or two distinct logical candidates only: the current
private Working Revision and the current public source revision. D69 MUST NOT
create a candidate table, materialized latest flag, Site setting, arbitrary
history, release list, or third scheduled candidate.

### D69-R2 — Private candidate qualification

**Latest saved draft** MUST mean the exact current server-acknowledged D12
Working Revision and MUST pass ADR-0191 Copy Qualification. Browser-only, debounced,
queued, in-flight, outcome-unknown, conflicted, superseded recovery/autosave,
rejected, restored-history, scheduled-only, release-only, and provider-latest
states MUST NOT qualify. Save-now and autosave MAY qualify only after the same
authoritative acknowledgement.

### D69-R3 — Public candidate qualification

**Current published version** MUST be the exact immutable source revision pinned
by D1's current favorable authorized public generation. Provider published
status, version order, a prior publication, and a schedule MUST NOT substitute.
The exact public head MUST also pass ADR-0191 Copy Qualification.

### D69-R4 — Distinctness and deduplication

The projection MUST independently apply ADR-0191 Copy Qualification to each exact
private/public head before enabled-candidate deduplication. It MUST then
deduplicate enabled heads by compatible versioned copy-manifest input identity.
When both equal-input heads qualify, Core MUST show one **Current published
version** row and explain that the saved draft has no newer copyable changes. An
unknown/unqualified public head MUST NOT hide a qualified equal-input private
head. It MUST NOT show duplicate enabled choices.

### D69-R5 — Deliberate, truthful choice

No candidate MAY be preselected or styled as recommended. Each accessible name
MUST identify the complete source locale, candidate kind, and public/private
state without duplicative timestamp narration. Its associated description MUST
provide the localized absolute save/publication time and timezone plus the
generic saved-work caveat where applicable; it MUST NOT disclose actual editor
activity. Relative time MAY supplement but MUST NOT replace the absolute value.
Author identity MUST be absent unless an independent permission permits it. A
distinct private head alongside a current public head
MUST say **Not public · Has unpublished changes**; a never-published private-only
head MUST say **Not public · Never published**.

### D69-R6 — No new policy or workflow authority

D69 MUST add no version-history browser, source policy, per-Site visibility
setting, approval, readiness state, task, notification, timer, resolver,
fallback, translation vendor, machine translation, or comparison engine. An
accepted D12 comparison MAY be invoked lazily as a non-gating secondary action.

### D69-R7 — Purpose-shaped enumeration

One server projection MUST filter exact source-lane/version-read and target-
creation eligibility before revealing candidates. Unauthorized existence,
count, kind, timestamp, author, title, body, and error distinctions MUST remain
non-enumerating. Payload Local API calls MUST use current actor context,
`overrideAccess:false`, exact version access, and fallback disabled. D69 MUST NOT
grant raw `readVersions` solely for Copy.

### D69-R8 — Exact authorized command

The resource-owned start command MUST receive target locale, selected exact
candidate reference/kind/head/revision, expected selected source-lane head,
expected target absence/head, and semantic idempotency key as untrusted claims.
Trusted server context MUST derive actor, Tenant, environment, Site, stable
resource, source locale, capability epoch, and time; reauthorize source read and
target create; and recheck lifecycle, safety, schema/profile/manifest/reference
compatibility, selected source-lane head/eligibility, and target absence/head. It
MUST never silently substitute a new head or history item. A change confined to
the unselected source lane MUST NOT invalidate an otherwise exact selected
candidate.

### D69-R9 — Immutable private evidence

Before a private candidate becomes Translation Basis evidence, the source owner
MUST freeze or reuse one immutable, retention-protected **Copy Source
Checkpoint** for that exact acknowledged Working Revision. Exactly one checkpoint
MUST exist per complete same-scope immutable copy-input identity (source revision
plus compatible manifest/canonicalization identity), and concurrent target-locale
starts MUST reuse it. A rolling/replaced autosave row or mutable latest pointer
MUST NOT be referenced. Checkpointing MUST NOT seize an editor lease, alter
source content, publish, notify, or create a second working head.

### D69-R10 — Atomic durable effect

The accepted adapter MUST atomically commit the required checkpoint, one private
target Working Revision, Translated provenance, exact D67 Basis, content-free
audit, idempotency receipt, and result, or commit none. It MUST make no remote
call while locks are held. If physical owners cannot prove this boundary, the
private lane MUST remain off; Core MUST NOT add a compensating saga/orphan repair
workflow to preserve the option.

### D69-R11 — Finite copy manifest

Copy MUST include only values and currently permitted stable references declared
by the versioned source-owned localization/copy manifest. It MUST NOT transfer
public/review/readiness/schedule/route/path/alternative/safety/assignment/editor-
lease/capability/validation/provider state. The target MUST validate
independently and remain private.

### D69-R12 — Private-Basis publication boundary

A target whose Basis is supported only by private checkpoint evidence MUST NOT
first publish as Translated. The blocker clears only when D1's current
authoritative source publication pins the same exact source revision represented
by the checkpoint under the same compatible copy-manifest/canonicalization
identity, or D67 compare/update/**Confirm translation is still current** creates
a successor Basis against the actual current publication. Until then, a derived
read-only target-readiness message MUST explain the block and show the existing
D67 compare/review action when authorized or a non-enumerating handoff otherwise.
D69 MUST NOT add a freshness state, embargo workflow, task, notification, or
second approval.

### D69-R13 — Concurrency and durable idempotency

Concurrent Start blank/Copy for the same target MUST have one structurally
unique winner. An authorized loser MAY open the existing draft but MUST NOT
overwrite it. Same semantic key and meaning MUST return the original result;
changed meaning MUST conflict. An unknown response MUST reconcile the receipt
before any retry can create a successor effect. Source/target locks MUST follow
one deterministic order.

### D69-R14 — Structural data and authorization invariants

Checkpoint, target, Basis, audit, and receipt MUST carry complete non-null same-
Tenant/Site/stable-resource scope, distinct exact locales, immutable revisions,
compatible versioned profiles/manifests/digests, restrictive evidence deletion,
trusted actor/time, and purpose indexes. The complete same-scope immutable copy-
input identity MUST structurally identify at most one Copy Source Checkpoint.
Exactly one Translation Basis MUST belong to every Translated target revision;
Independent/Legacy revisions MUST have none.
Minimum grants, applicable ENABLE/FORCE RLS, operation-correct `USING` and `WITH
CHECK`, security-invoker views, hardened functions, and direct-DML/privileged-
path poison tests MUST preserve the same boundary.

### D69-R15 — No public or adjacent-domain effect

D69 candidates, order, checkpoint state, and a Basis supported only by private
source evidence MUST NOT be favorable-generation, public-reader/runtime/serving,
route, alternative, language-control,
Navigation, search, sitemap, canonical/`hreflang`, cache-key/tag, Vercel, Giving,
currency, Stripe, settlement, message, receipt, or payment authority/input. The
trusted D67 publication-eligibility command MUST inspect the exact Basis,
checkpointed revision identity, and D1 public-source head only to deny or prove
the D69-R12 gate before Public Site Generation may accept a favorable successor.
That proof is not runtime resolution or serving content. Public Site Generation
remains the sole favorable serving authority.

### D69-R16 — Base Maia interaction and recovery

Core MUST implement the ADR-0190 unselected Sheet/RadioGroup copy, footer,
persistent target receipt, loading/empty/error/offline/stale/access/target-race/
unknown-result states, focus recovery, and no-second-confirmation flow. It MUST
focus the Sheet title with `tabIndex="-1"` on open; Tab MUST then enter the first
unchecked radio without selecting it, and close MUST restore **Copy from…**. It
MUST include the derived private-source publication blocker/remediation near
target readiness. After successful creation, it MUST invoke D12's ordinary target
Active Editor Lease acquisition against the returned target head; a lease race
MUST open D12's truthful read-only/collaboration state without retrying Copy,
deleting the created target, changing its receipt, or transferring the source
lease. It MUST pass keyboard, screen reader, touch, forced colors, reduced
motion, 320 CSS
pixel/400% reflow, long/CJK/RTL/bidi, weak-network, and staff JavaScript-failure
proof. **Published** MUST NOT be relabelled **Live**.

### D69-R17 — Bounded private reads

Candidate enumeration MUST use compact immutable ADR-0191 source-side Copy
Qualification Evidence bound to each exact source revision/digest admitted by
ADR-0191/D70-R5: a D12 Working Revision or D1 exact current published revision,
compose it with the exact target locale/profile, and run one batched live scope,
authorization, lifecycle, safety, and stable-reference query. Evidence alone is
never full target/action qualification. It MUST NOT
fetch candidate bodies, diffs, or history merely to render choices and MUST NOT
perform per-locale N+1 or remote work. Missing, unknown, unsupported, digest-
mismatched, or contract-incompatible evidence MUST NOT be favorable. After
deliberate selection, the command MUST read the exact selected body, verify its
digest and versioned source-contract digest covering schema/profile/manifest/
canonicalizer/qualifier/block/node/package versions and limits, rerun D70 structural
qualification, and reauthorize every transferred reference before any write.
Body/diff MAY load only after explicit authorized selection/action. Private
evidence/responses/content MUST be `no-store` and MUST NOT enter public,
Vercel/shared, or persistent browser caches.

### D69-R18 — Dependency, migration, rollout, and proof gate

Activation MUST require accepted D1/D12/D22/D32 equivalents, D67-D71, one
consolidated Phase 24 OpenSpec delta, installed-Payload-pin conformance,
provider-neutral contract tests, representative usability proof, and production-
shaped authorization/concurrency/retention/performance evidence. Migration MUST
infer no candidate from provider history/status/time. Rollout MUST prove the
published lane—including retained-reader/digest proof for an exact legacy D1
current publication where needed—before cohort-enabling private Copy. A private-lane kill switch
MUST remove only new private offers/writes; rollback MUST preserve all existing
checkpoints, targets, Bases, audit, and receipts plus compatible readers,
provenance display, the derived publication blocker, and D67 remediation. It MUST
be writer-off/roll-forward only and MUST NOT deploy a reader that cannot
interpret existing checkpoint provenance.

## Falsifiable acceptance criteria

1. **AC1 — No eligible source:** an authorized missing target with no Copy
   candidate can still choose Start blank; no hidden-source fact is disclosed.
2. **AC2 — Published only:** an eligible locale with only a current authorized,
   ADR-0191-qualified public head shows exactly one unselected Current published
   version row.
3. **AC3 — Private only:** a never-published locale with one acknowledged,
   ADR-0191-qualified private head shows exactly one unselected **Latest saved draft —
   Not public · Never published** row and implies no prior publication.
4. **AC4 — Two distinct heads:** a newer qualified private head plus qualified
   current public head produces exactly two correctly labelled rows in private-then-
   public order without recommendation styling.
5. **AC5 — Same copy input:** equal compatible copy-manifest identities produce
   one public row and the no-newer-copyable-changes explanation only after both
   exact heads independently qualify; an unknown/unqualified public head never
   hides a qualified private row.
6. **AC6 — Public wording:** a private head beside a current public head says
   **Not public · Has unpublished changes**, a private-only head says **Not public
   · Never published**, and the public helper accurately identifies what visitors
   currently receive; no UI says Live or implies Copy publishes.
7. **AC7 — Save acknowledgement:** identical content saved through autosave or
   Save now qualifies only after the same server acknowledgement and exact head.
8. **AC8 — Transient work:** browser-only, queued, debounced, in-flight,
   outcome-unknown, and conflict state never appears or copies.
9. **AC9 — History exclusions:** superseded autosave/recovery, restored history,
   rejected candidate, prior publication, and arbitrary version never appears.
10. **AC10 — Schedule exclusion:** a schedule/release pointing at either head
    creates no third candidate and transfers no schedule.
11. **AC11 — Private enumeration:** actors missing exact source-version access
    cannot distinguish no private head from an unauthorized private head through
    rows, counts, timestamps, timing/error shape, logs, or cache.
12. **AC12 — Tenant/Site isolation:** cross-Tenant, cross-Site, wrong-resource,
    same-code-locale, and forged-revision attempts produce no read or write.
13. **AC13 — Authorization loss:** capability epoch, source read, target create,
    safety, or lifecycle loss after display produces nothing and reveals no new
    private fact.
14. **AC14 — Selected private-head race:** when private is selected, a changed
    private head or private-candidate eligibility fact conflicts with the exact
    saved-draft message, clears selection on refresh, and never substitutes; a
    change confined to the unselected public lane does not fail an otherwise
    exact private Copy.
15. **AC15 — Selected public-head race:** when public is selected, an advanced
    public generation or public-candidate eligibility fact conflicts with the
    exact published-version message, clears selection on refresh, and never
    substitutes; a change confined to the unselected private lane does not fail
    an otherwise exact public Copy.
16. **AC16 — Target race:** simultaneous Start blank/Copy has one unique winner;
    an authorized loser receives Open existing draft and no overwrite occurs.
17. **AC17 — Idempotent replay:** same key and meaning after lost acknowledgement
    returns the same target/checkpoint/Basis/receipt without duplicate writes.
18. **AC18 — Changed meaning:** reuse of a key with another source head, target,
    or manifest conflicts and creates nothing.
19. **AC19 — Atomic fault injection:** failure after every internal write point
    proves checkpoint, target, provenance, Basis, audit, receipt, and result all
    commit or none do; no remote call occurs under lock.
20. **AC20 — Evidence uniqueness and retention:** concurrent French and Spanish
    starts from one complete same-scope immutable source-copy identity create/
    reuse exactly one checkpoint while producing distinct target Bases; pruning/
    restoring/coalescing Payload versions cannot mutate or dangle it; legal
    erasure preserves minimum non-content evidence and yields Could not be
    checked when necessary.
21. **AC21 — Manifest boundary:** hostile/unclassified fields and forbidden/
    foreign references, public state, schedules, paths, leases, capabilities,
    approval, and provider metadata do not copy.
22. **AC22 — Unproved-source publication denial and explanation:** a target whose
    Basis is supported only by private checkpoint evidence cannot enter a
    favorable public generation, including through direct DML, service/secret,
    Payload bypass, worker, importer, AI, or stale app paths. Its target-readiness
    UI persistently explains the blocker, with exact authorized source detail or
    a non-enumerating handoff.
23. **AC23 — Exact checkpointed revision publication:** when D1's current
    authoritative source publication pins the same exact source revision
    represented by the checkpoint under the same compatible copy-manifest/
    canonicalization identity, the normal D67/publication path can prove it
    without rewriting historical evidence and the derived blocker clears without
    mutating the immutable creation receipt.
24. **AC24 — Divergent publication:** when another source revision publishes,
    target publication remains blocked until D67 creates an explicit reviewed
    successor Basis; authorized viewers receive the existing compare/review
    action, other viewers receive a non-enumerating handoff, and no automatic
    rebase occurs.
25. **AC25 — Accessible deliberate UX:** Base Maia Sheet/RadioGroup, names,
    descriptions, disabled create, no second confirmation, touch targets,
    title-first `tabIndex="-1"` focus, Tab entering the first unchecked radio
    without selection, close restoring **Copy from…**, keyboard, screen reader,
    forced colors, reduced motion, zoom/reflow, long/CJK/RTL/bidi, and mobile
    footer pass production-shaped tests.
26. **AC26 — Truthful recovery and target-lease handoff:** loading, authoritative
    empty, query failure, offline, stale heads, access loss, target race, unknown
    result, and proved failure show ADR-0190 outcomes; selection is preserved only
    when still exact. After success, D12 target-lease acquisition either enables
    editing or truthfully opens its read-only/collaboration state without
    retrying/deleting Copy or changing the receipt; no source lease transfers.
27. **AC27 — Read/cache budget:** one open performs at most one bounded preference
    read plus immutable D70 evidence and one batched metadata/live-fact query,
    no candidate-body/diff/history N+1; selected exact body is requalified before
    write; private responses are `no-store` and absent from public/shared/
    persistent browser caches; measured p95 meets the release budget below.
28. **AC28 — Safe rollout/rollback:** no history-derived backfill occurs;
    published-only works before private activation; private kill switch preserves
    Start blank/published Copy, all prior durable evidence, compatible readers,
    provenance display, publication blocker, and D67 remediation. Rollback is
    writer-off/roll-forward and never strands a target behind an incompatible
    reader.
29. **AC29 — Provider and database conformance:** the installed Payload pin and a
    provider-neutral fake pass identical head/dedupe/access/retention/restore
    contracts; scoped constraints, grants, RLS `USING`/`WITH CHECK`, views,
    functions, indexes, and privileged poison tests pass, including proof that a
    Translated revision can have neither zero nor multiple Bases and that an
    Independent/Legacy revision can have none.
30. **AC30 — Traceability and user proof:** one matrix links D69 founder answer,
    glossary, ADR-0190, D69-R1–R18, OpenSpec, design, tickets, implementation,
    tests, and release evidence without contradictory terms/states/numbers; at
    least five representative ministry editors, including one mobile/assistive-
    technology session, complete correct private/public choices with zero
    critical misunderstanding before activation.

## Required monitors

| Signal                                                    |                                                Threshold | Owner                      | Required response                                                                                                                                                                                                                      |
| --------------------------------------------------------- | -------------------------------------------------------: | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `translation_copy_cross_scope_accept_total`               |                                         Any in 5 minutes | Security + CMS Platform    | Disable all Copy, preserve evidence, open P0 incident, trace command/privileged path, and prove scope repair before re-enable.                                                                                                         |
| `translation_copy_private_candidate_disclosure_total`     |                                      Any confirmed event | Security + Web Studio      | Disable private lane, purge affected private caches, investigate projection/logs, notify through incident policy, and re-prove non-enumeration.                                                                                        |
| `translation_copy_unretained_basis_total`                 |                                                      Any | CMS Platform + Data        | Disable private lane and affected publication, retain/tombstone evidence, reconcile references, and open P0 data-integrity incident.                                                                                                   |
| `translation_copy_partial_commit_total`                   |                                                      Any | CMS Platform               | Disable private lane, reconcile by durable receipt without inventing state, open P0, and re-prove atomic adapter before enablement.                                                                                                    |
| `translation_publish_unproved_source_basis_accept_total`  |                                                      Any | CMS Publication + Security | Fire only when favorable target publication lacks a current exact source-publication match or reviewed successor; fence the generation, disable affected publication/private Copy, open P0, and restore only from proved D67 evidence. |
| `translation_copy_duplicate_target_total`                 |                                                      Any | CMS Platform               | Disable target creation for affected scope, reconcile winner/receipts, inspect uniqueness/idempotency, and prove no overwrite.                                                                                                         |
| `translation_copy_duplicate_head_render_total`            |                                        Any in 15 minutes | Web Studio + CMS Adapter   | Suppress the ambiguous locale/private lane, retain Start blank and only a separately server-proved public row, repair the server projection/dedupe contract, and never let the client choose authority.                                |
| `translation_copy_stale_candidate_conflict_ratio`         | Greater than 5% for 30 minutes with at least 20 attempts | Web Studio + CMS Platform  | Inspect save/head churn and picker latency, improve refresh/metadata freshness, and never weaken CAS or silently retarget.                                                                                                             |
| `translation_copy_unknown_outcome_unresolved_age_seconds` |  Oldest unresolved outcome over 60 seconds for 5 minutes | CMS Operations             | Investigate receipt lookup/transaction acknowledgement, suppress repeated submit, reconcile exact result, and page platform owner if sustained.                                                                                        |
| `translation_copy_picker_metadata_latency_ms`             |   p95 over 300 ms for 30 minutes with at least 100 opens | Web Studio + Data          | Trace query/index/cardinality, eliminate N+1/eager reads, and keep private no-store; do not introduce shared caching.                                                                                                                  |

## Ruthless synthesis and execution order

### Must be resolved before recording

Resolved in ADR-0190 and this review:

1. Replace provider “latest draft” with the exact D12 acknowledged Working
   Revision and D1 current public revision.
2. Deduplicate identical copy inputs and keep the chooser unselected.
3. Freeze private selection into immutable retention-protected evidence.
4. Enforce the D67 public-source boundary for targets supported only by private
   source evidence.
5. Keep D69 to one projection and one atomic resource command with no settings,
   history browser, workflow, or public resolver.

### Must enter consolidated Phase 24 OpenSpec/design before ticketing

1. D69-R1–R18 and AC1–AC30, including ADR-0191's accepted D70 contract and D71's
   accepted unavailable-source presentation.
2. Exact D1/D12/D22 owner interfaces and the atomic checkpoint/target/Basis/
   receipt storage boundary.
3. Versioned copy manifest, canonicalization/profile compatibility, evidence
   retention and minimum legal-erasure tombstone rules.
4. Purpose-shaped candidate projection, trusted command authorization, complete
   scoped constraints/RLS/grants/indexes, deterministic lock order, and durable
   idempotency.
5. ADR-0190 Base Maia UX states, accessibility, privacy/cache, and public-runtime
   isolation.

### Required implementation safeguards

1. Land/read-test the published candidate and safe empty/degradation paths first.
2. Prove Payload-pin and provider-neutral head/access/retention behavior.
3. Prove all-or-none private command fault injection and direct-DML/privileged-
   path poison tests before enabling the private candidate.
4. Run cross-Tenant/Site/resource, stale-head, duplicate-target, lost-response,
   pruning/restore, public-gate, accessibility, weak-network, and measured-query
   tests at the public seams.
5. Enable private Copy by bounded cohort behind a kill switch that cannot remove
   Start blank, published Copy, or existing evidence.

### Monitor after release

Only the ten signals above qualify for monitor status because each has a named
threshold, owner, and response. All cross-scope disclosure, evidence loss,
partial commit, unproved-source publication, and duplicate-target signals are
zero-tolerance release incidents; they are not accepted residual behavior.

## Final disposition

**Accept with required amendments.** The founder's two-head product decision is
the best balance of parallel editorial work and understandable staff choice.
The unamended wording is unsafe because a moving draft alias is not durable
provenance and private meaning is not public source truth. ADR-0190's exact
logical heads, immutable checkpoint, atomic command, D67 publication boundary,
purpose-shaped authorization, bounded Base Maia UX, staged proof, and kill-switch
degradation are mandatory parts of the accepted decision.

No runtime, schema, migration, Payload/Vercel setting, Supabase policy, ticket,
or merged OpenSpec changed in this grooming step. Implementation remains blocked
on the named foundations, D71, consolidated OpenSpec, and release evidence.
