# Phase 24 D71 — Qualified choices with a visible unavailable-source list: adversarial review

**Date:** 2026-08-30  
**Scope:** Phase 24 D71, following ADR-0189/0190/0191 and D68–D70  
**Founder answer:** **Option 1 — one visible unavailable-head list immediately
after the qualified RadioGroup**

## Decision under review

The founder selected the most discoverable of three permission-safe
presentations. The intended staff outcome is simple: selectable source versions
remain one ordinary radio choice; authorized versions that cannot currently be
selected remain visible immediately afterward with truthful cause-owned recovery.

The answer cannot be accepted literally without amendment. “Unavailable” needs a
closed server-owned disposition rather than a client Boolean; whole-query failure
must remain separate; status rows/actions need exact context and reauthorization;
retry/focus/mixed-version behavior must be deterministic; and the implementation
must use Core's existing Base Maia components without inheriting the shared Item
description's default line clamp.

**Disposition:** **Accept with required amendments.** ADR-0192 records the
corrected permanent decision.

## Current behavior, intended behavior, and permanent path

| Layer            | Verified current behavior                                                                                                                                    | Intended D71 behavior                                                                                                        | Best permanent path                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime          | Current `develop` has Payload Pages drafts/autosave but no exact-locale D69–D71 projection, Copy Sheet, unavailable-source list, or Check-again command.     | One docs-defined D71 presentation over accepted D68–D70 owners.                                                              | Implement only after accepted dependencies and consolidated Phase 24 OpenSpec; infer nothing from current Payload status/history.        |
| Radio choice     | Shared `@asym/ui` uses Base UI RadioGroup/Radio; app examples compose ordinary enabled choices.                                                              | Only qualified exact heads are enabled, unselected radios.                                                                   | Reuse Base Maia `FieldSet`/`FieldLegend`/RadioGroup; no disabled source radios or app-local primitive.                                   |
| Status content   | Shared `Item` can show title, description, and actions; `ItemDescription` currently line-clamps to two lines and `ItemGroup` renders `role=list` on a `div`. | One visible, nonselectable, fully wrapping semantic list after the fieldset.                                                 | Compose existing Item parts over native `ul`/`li` semantics and opt out of clamping through the supported composition; do not fork Item. |
| Async feedback   | Core contains several `role=status` uses, but no D71 status owner.                                                                                           | One initially empty aggregate polite/atomic status for user-triggered recovery outcomes; static rows are never live regions. | Reuse existing accessible status convention and Base UI focus management; prohibit per-row chatter.                                      |
| Data/auth        | No D71 table, RLS policy, grant, RPC, cache, or response type exists.                                                                                        | Rebuildable viewer/action-specific disposition with no persistence or new authority.                                         | Extend the purpose-shaped D69/D70 DTO additively; inherit its complete scope, RLS/grants, batching, and final command checks.            |
| Formal authority | OpenSpec has no D67–D71 requirements; Phase 23 PR #1340 was verified `OPEN/BLOCKED` on 2026-08-30.                                                           | D71 remains a groomed target decision.                                                                                       | Reconcile accepted D12/D22/D32 equivalents and consolidate D67–D71 into one Phase 24 change before design/tickets/runtime work.          |

## Evidence classification

### Verified repository facts

- Root `AGENTS.md`, `docs/ai/rules/frontend.md`, and `packages/ui/AGENTS.md`
  require exact `base-maia`, Zinc-oriented semantic tokens, Base UI primitives,
  shared ownership in `packages/ui`, and no app-local shadcn forks.
- Live `shadcn info --json` confirms `style: base-maia`, primitive base `base`,
  Tailwind v4, semantic CSS variables, and Lucide; RadioGroup, Item, Sheet, Empty,
  Field, Button, and Spinner are installed.
- `packages/ui/components/shadcn/radio-group.tsx` delegates behavior to Base UI.
  Unavailable rows therefore must not masquerade as items in that composite.
- `packages/ui/components/shadcn/item.tsx` is the closest reusable content/action
  composition. Its default description line clamp is incompatible with essential
  D71 identity/reason/recovery text unless the feature composes a non-clamped
  variant through existing class merging.
- ADR-0189 already owns D68 ordering, one bounded preference read plus batched
  eligibility, optional keyset/search when measured catalogs warrant it, and no
  effective result sharing across viewers.
- ADR-0190 owns one unselected qualified RadioGroup, selected-lane CAS,
  target-creation idempotency, loading/query failure, and the p95 300 ms metadata
  budget.
- ADR-0191 owns effective Copy Qualification, source evidence, exact reason
  ownership, unknown recovery, non-enumeration, and qualified-only deduplication.
- Current source contains no `Copy into`, `Latest saved draft`, or D71 status-list
  implementation. Documentation is intended behavior, not shipped truth.

### Verified primary external evidence

| Source                                                                                                                                          | Verified practice                                                                                                                                               | D71 use                                                              | Boundary retained                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [W3C APG Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)                                                                          | A RadioGroup is one mutually exclusive composite; Tab enters once and arrows move/select within it. Additional descriptions associate without becoming choices. | Keep only qualified choices inside the group.                        | APG is interaction guidance; Core/Base UI remains implementation authority.   |
| [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)                                                    | Important asynchronous outcomes that do not take focus must be programmatically determinable.                                                                   | One aggregate polite/atomic result announcement.                     | Static list rows are ordinary content, not repeated live regions.             |
| [Base UI Radio](https://base-ui.com/react/components/radio) and [Dialog](https://base-ui.com/react/components/dialog)                           | Radios belong to RadioGroup; Dialog exposes intentional initial/final focus control.                                                                            | Reuse installed primitives and deterministic focus recovery.         | D71 does not build ARIA behavior manually.                                    |
| [shadcn/Base UI Item](https://ui.shadcn.com/docs/components/base/item)                                                                          | Item is intended for content with title, description, and actions, grouped as a list.                                                                           | Repo-native row composition without making it selectable.            | Native list semantics and Core non-clamp requirements still must be explicit. |
| [GOV.UK radios](https://design-system.service.gov.uk/components/radios/) and [buttons](https://design-system.service.gov.uk/components/button/) | Radios represent one choice and should not be preselected; disabled controls may confuse and should be avoided without evidence.                                | Supports unselected radios plus separate explanatory content.        | GOV.UK does not define Core permissions or source dispositions.               |
| [Drupal Content Translation](https://www.drupal.org/docs/8/core/modules/content-translation/overview)                                           | Translation views expose source language, status, and permission-shaped operations.                                                                             | Supports visible authorized head/status context.                     | Drupal's storage/workflow is not Core authority.                              |
| [Contentful localization strategies](https://www.contentful.com/help/localization/field-and-entry-localization/)                                | Locale work, governance, and asynchronous publishing are separate concerns.                                                                                     | Reinforces version/locale visibility without publication conflation. | Core rejects provider fallback/publication shortcuts.                         |

### Reasonable inferences

- Occasional ministry staff will notice when a recent saved version disappears;
  showing a calm exact row is likely clearer than hiding it. No frequency or
  conversion claim is made.
- One visible list is proportionate because D69 admits at most two heads per
  locale and D68 already owns paging/search. Actual Site Locale catalog sizes and
  DOM-density thresholds remain unmeasured and must be proved before activation.
- A short reason family improves recovery only when its owner can guarantee the
  action really addresses that exact head. This is a product judgment, not a
  claim about every ministry workflow.

### Product judgments

- **Copy Source Disposition** is the precise term. “Unavailable row,”
  `is_copyable`, and HTTP failure are not authoritative models.
- The list heading is **Unavailable source versions**; unknown rows are
  operationally unavailable for selection now but retain distinct row wording.
- V1 displays no unavailable count. Count-free visible rows are clearer and safer.
- Neutral text and semantic tokens are correct; unavailable Copy is not a form
  error, security alarm, or destructive event.
- Option 2, one APG Disclosure around the same semantic list, is the strongest
  alternative if production-shaped catalog research later proves visible density
  materially harmful. It is not an automatic mobile fallback.

### Assumptions and release evidence still required

- D68/D69's actual page/search contract and maximum Site Locale catalog have not
  shipped or been measured.
- Accepted D12/D22/D32 physical contracts do not exist on current `develop`.
- Representative ministry-editor research must validate the four reason families,
  source actions, and unavailable-versus-unknown comprehension.
- The configured UI-skill search helper is absent, so this review uses the
  skill's written rules, verified Base Maia configuration/source, and primary
  external documentation rather than claiming generated design-system output.

## Ruthless category review

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes.** **What could go wrong:** hiding every authorized
unavailable head makes recent work appear lost, while a disabled radio makes a
nonchoice look almost selectable. **Why it matters:** staff may distrust the
chooser, retry edits blindly, or select a less appropriate source. **Severity:
Medium. Likelihood: Medium.** D69 permits private work specifically for parallel
localization, and modern translation/version views preserve visible state, but
Core tenant frequency remains unmeasured. **Decision effect:** keeps Option 1 but
requires a separate visible semantic list; Option 2 remains the strongest density
alternative. **Permanent fix:** use one exact derived disposition and show only
authorized unavailable/unknown heads after qualified choices. **Exact spec
language:** D71-R1–R4, R13, R16; AC1–AC12, AC24, AC28.

### 2. Brittleness

**Material concern: Yes.** **What could go wrong:** UI inferred from a missing
candidate, `is_copyable`, HTTP status, Payload error, or nullable reason can
collapse unavailable, unknown, unauthorized, and whole-query failure. **Why it
matters:** one provider or schema change would alter both disclosure and user
action. **Severity: High. Likelihood: High** without a closed contract. Current
Core has none, and Payload status is explicitly not D70 authority. **Decision
effect:** replaces informal list rules with an exhaustive internal disposition
and global-failure boundary. **Permanent fix:** server-owned, versioned,
provider-neutral derivation with fail-closed unknown variants. **Exact spec
language:** D71-R1–R3, R5–R6, R15; AC4–AC10, AC25.

### 3. Technical debt

**Material concern: Yes.** **What could go wrong:** a D71 table, status Boolean,
client reason map, second query, new retry job, or app-local unavailable-card
component duplicates D68–D70 and Base Maia. **Why it matters:** every new content
type, reason, and authorization rule would require synchronized systems and
migrations. **Severity: High. Likelihood: High** because “show an unavailable
row” sounds deceptively local. **Decision effect:** substantially narrows
implementation. **Permanent fix:** a rebuildable typed view over one existing
projection, source-owned reason/action mapping, existing Item/Field/Radio/Sheet
composition, and no D71 persistence. **Exact spec language:** D71-R1, R4, R6–R7,
R13–R15; AC1, AC15–AC19, AC24–AC26.

### 4. Edge cases

**Material concern: Yes.** **What could go wrong:** zero/one/two heads per locale,
equal input with different qualification, all-unavailable, mixed unknown/
unavailable, never-published private work, immutable public work, paging, source
loss, access loss, offline, and global failure can render contradictory controls.
**Why it matters:** staff may see an empty radio group, wrong recovery, false
count, or a qualified sibling hidden by an unqualified head. **Severity: High.
Likelihood: High** in collaborative multilingual editing. **Decision effect:**
adds an explicit state matrix and qualified-only dedupe. **Permanent fix:** cover
every disposition/transition independently for each exact head and preserve Start
blank. **Exact spec language:** D71-R1–R5, R7, R10–R13; AC2–AC13, AC18–AC24,
AC27.

### 5. Footguns

**Material concern: Yes.** **What could go wrong:** disabled radio glyphs,
row-click selection, red alerts, **Open source draft** for an immutable public
head, raw schema errors, **Retry** for a global failure, or auto-selection after
success can drive the wrong action. **Why it matters:** source identity and Copy
meaning change with the head; misleading recovery can mutate unrelated work.
**Severity: Critical. Likelihood: High** without exact semantics. **Decision
effect:** changes row structure, copy, and actions. **Permanent fix:** ordinary
list items, neutral status, at most one head/cause-accurate action, no raw errors,
and never auto-select. **Exact spec language:** D71-R3–R7, R10–R12; AC3–AC6,
AC14–AC23, AC27–AC28.

### 6. Tenant safety

**Material concern: Yes.** **What could go wrong:** row presence, head kind,
timestamp, publication state, reason, action, count, page size, error, or timing
could reveal another Tenant/Site/resource/locale or sensitive private ministry
work. **Why it matters:** even content-free metadata may expose campaigns,
locations, or unreleased plans. **Severity: Critical. Likelihood: Medium** unless
authorization precedes every projection step. **Decision effect:** removes V1
counts and requires non-enumeration before ordering/paging. **Permanent fix:**
trusted complete scope, viewer-shaped response, private `no-store`, equivalent
unauthorized/nonexistent behavior, and hostile timing fixtures. **Exact spec
language:** D71-R5, R8, R13–R16; AC7–AC8, AC13–AC14, AC19, AC24–AC27.

### 7. Database, RLS, and authorization safety

**Material concern: Yes.** **What could go wrong:** a direct status-table read,
caller-supplied reason/head/action, broad Check-again RPC, missing `WITH CHECK`, or
service-role query may bypass D69/D70 scope even though the UI hides rows. **Why it
matters:** an allowed read/retry could reveal or act on a forbidden source.
**Severity: Critical. Likelihood: High** if D71 invents a data path. Supabase
separates grants from RLS, and current Core requires privileged-path parity.
**Decision effect:** D71 creates no schema, grant, policy, view, function, RPC, or
write. **Permanent fix:** consume only the trusted D68–D70 projection/recovery,
inherit complete same-scope relationships/minimum grants/FORCE RLS/operation-
correct `USING` and `WITH CHECK`, and reauthorize actions at use. **Exact spec
language:** D71-R5, R7–R10, R14–R16; AC7–AC8, AC14–AC20, AC24–AC26.

### 8. Overengineering

**Material concern: Yes.** **What could go wrong:** the list could grow into a
repair queue, issue center, bulk retry, comments, assignments, notifications,
workflow, or mobile accordion. **Why it matters:** a two-head explanation becomes
another localization product and hides ordinary qualified choices. **Severity:
High. Likelihood: High** because cause/recovery invites workflow scope. **Decision
effect:** rejects those extensions. **Permanent fix:** one visible semantic list,
at most one existing cause-owned action per row, no count, and no automatic
collapsed/mobile variant. **Exact spec language:** D71-R4, R6–R7, R9, R12–R16;
AC11–AC18, AC24–AC28.

### 9. UX/UI and user friction

**Material concern: Yes.** **What could go wrong:** losing locale association,
clamped descriptions, dense cards, warning colors, nested controls, noisy live
regions, unreachable mobile footer, or focus disappearance makes the “clear” list
harder than hidden rows. **Why it matters:** occasional staff must understand the
available choice and the unavailable explanation in seconds. **Severity: High.
Likelihood: High.** Current Item description clamps at two lines; W3C/APG and the
verified Base Maia setup require deliberate semantics/focus. **Decision effect:**
adds the exact section hierarchy, neutral Item composition, non-clamping, one
aggregate status, focus rules, 44-pixel actions, and mobile stacking. **Permanent
fix:** one persistent **Source version** heading and labelled RadioGroup first,
Unavailable source versions section second, footer last; full wrap and complete
manual/automated a11y proof. **Exact spec language:** D71-R3–R7, R11–R13, R16;
AC2–AC6, AC11–AC18, AC20–AC24, AC27–AC28.

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes.** **What could go wrong:** D71 rows, client cache,
Payload status, reason strings, and D70 evidence could each claim whether a head
is copyable. **Why it matters:** a display projection may become write or
publication authority. **Severity: Critical. Likelihood: High** without precise
vocabulary. **Decision effect:** establishes Copy Source Disposition as derived
presentation only. **Permanent fix:** D12/D1 own heads, D70 owns evidence/effective
qualification/reasons, D69 owns candidate/effect, D71 renders; D1/D66 remain
publication authority. **Exact spec language:** D71-R1–R7, R10, R14–R16; AC1–AC6,
AC9–AC10, AC18–AC26.

### 11. Hidden coupling

**Material concern: Yes.** **What could go wrong:** a new Payload error, block
name, provider version, D32 finding, or list component style may silently change
the reason/action or eligibility. **Why it matters:** unrelated changes can expose
private detail, send staff to the wrong surface, or remove Copy. **Severity: High.
Likelihood: High** in an evolving CMS. **Decision effect:** provider/free-form
states cannot drive D71 directly. **Permanent fix:** one versioned code-owned safe
reason/action mapping, provider-neutral DTO, and separate source findings.
**Exact spec language:** D71-R1, R3, R5–R7, R14–R16; AC5–AC6, AC13–AC19,
AC24–AC27.

### 12. Failure modes

**Material concern: Yes.** **What could go wrong:** whole-query failure, one-head
unknown, source-opening failure, Check-again rejection, offline use, lost response,
or stale projection may all say Retry and then diverge. **Why it matters:** false
per-head diagnoses, duplicate work, or disappearing focus erode trust. **Severity:
High. Likelihood: Medium-high** under weak networks and mixed deployments.
**Decision effect:** separates global versus head failure and gives every recovery
one owner. **Permanent fix:** D69 global failure, D70 exact idempotent recheck,
head-accurate source navigation, offline no-queue, one aggregate announcement, and
receipt/work reconciliation. **Exact spec language:** D71-R2, R7, R9–R14;
AC6–AC8, AC16–AC23, AC26–AC27.

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes.** **What could go wrong:** head/evidence/access/action may
change between page, render, focus, Check again, source handoff, and return; two
tabs may request the same proof. **Why it matters:** an individually valid action
may repair or qualify the wrong revision, duplicate evaluation, or create a stale
selection. **Severity: Critical. Likelihood: High** in collaborative authoring.
**Decision effect:** adds exact identity, same-snapshot derivation, action-time
reauthorization, semantic idempotency, no auto-selection, and deterministic focus.
**Permanent fix:** reuse D69/D70 CAS/work identity/backoff/reconciliation and treat
stale actions as non-enumerating no-effects. **Exact spec language:** D71-R1,
R5–R11, R15–R16; AC9–AC10, AC17–AC25, AC27.

### 14. Data integrity risks

**Material concern: Yes.** **What could go wrong:** a stale row may open or
recheck a successor revision, candidate/status members may overlap, or an old
client may interpret a new status as selectable. **Why it matters:** Copy may pin
the wrong source or mixed versions may manufacture authority. **Severity:
Critical. Likelihood: High** without exact typed boundaries. **Decision effect:**
adds exact head/context keys and an additive noncandidate response member.
**Permanent fix:** nonoverlapping discriminants, old-client fixture, same-snapshot
page, final D69 proof, and stale-action no-op. **Exact spec language:** D71-R1,
R3, R5, R9–R10, R13, R15–R16; AC2–AC10, AC17–AC26.

### 15. Security and privacy risks

**Material concern: Yes.** **What could go wrong:** raw block/provider errors,
IDs, schema versions, hidden counts, logs, cache, or caller-built source URLs can
expose sensitive content or create an open redirect/authorization bypass. **Why
it matters:** missionary/member-care or unreleased ministry information is highly
sensitive even without the body. **Severity: Critical. Likelihood: High** if a
generic error component is reused. **Decision effect:** narrows display and
telemetry. **Permanent fix:** bounded content-free copy, no count, server-built
head-accurate destinations, data minimization, `no-store`, redacted metrics, and
privileged-path poison tests. **Exact spec language:** D71-R5–R10, R13–R16;
AC5–AC8, AC13–AC20, AC24–AC27.

### 16. Scalability and performance risks

**Material concern: Yes.** **What could go wrong:** a visible list can double DOM
rows, trigger per-head queries/body reads, poll every unknown, or render all
locales eagerly. **Why it matters:** multilingual Sites and low-bandwidth field
conditions would make the Sheet slow and shift content. **Severity: Medium-high.
Likelihood: Medium.** D68 catalogs are unmeasured, but D68 already defines
paging/search and D69 a 300 ms metadata budget. **Decision effect:** visible list
is accepted only inside those existing bounds. **Permanent fix:** one snapshot,
one batched query, same cursor, no count/body/N+1/polling/shared cache, reserved
space, and maximum-catalog DOM/query evidence. **Exact spec language:** D71-R2–R4,
R9, R11, R13, R16; AC8–AC12, AC17, AC20–AC24, AC27–AC28.

### 17. Operational burden

**Material concern: Yes.** **What could go wrong:** staff may be told to repair a
platform/profile cause, support may need direct DB changes, or retries may create
orphan work. **Why it matters:** self-service localization becomes developer-
dependent. **Severity: High. Likelihood: Medium.** D70 already owns exact
evaluation and source/platform cause boundaries. **Decision effect:** actions are
cause-owned and platform causes expose no false tenant fix. **Permanent fix:**
reuse D70 reconciliation/runbooks, source editor only when effective, Start blank/
qualified alternatives always, and no D71 cleanup workflow. **Exact spec
language:** D71-R6–R10, R12, R14, R16; AC12, AC14–AC20, AC26–AC28.

### 18. Observability and auditability gaps

**Material concern: Yes.** **What could go wrong:** support cannot distinguish an
unqualified radio, disclosure, reason/action mismatch, disposition conflation, or
stale action; content-rich logs may create another leak. **Why it matters:** safe
diagnosis and containment become impossible. **Severity: High. Likelihood:
Medium.** D71 spans projection, UI mapping, navigation, and D70 recovery.
**Decision effect:** adds five content-free D71 signals and reuses D69/D70 latency/
recovery monitors. **Permanent fix:** cause-coded low-cardinality metrics, exact
threshold/owner/response, correlation to existing work identity, and no body/
private ID in labels. **Exact spec language:** D71-R1–R10, R13–R16; AC7–AC10,
AC14–AC27 and monitors below.

### 19. Dependency and integration risks

**Material concern: Yes.** **What could go wrong:** Base UI/shadcn updates,
Payload errors, D32 finding changes, or a provider retry may redefine semantics.
**Why it matters:** upgrades can break keyboard behavior or expose provider
jargon. **Severity: High. Likelihood: Medium.** Base Maia and current versions are
verified, but Phase 23 owners are unmerged. **Decision effect:** activation is
provider-neutral and exact-pin gated. **Permanent fix:** installed Base UI/
Payload conformance, native semantic fixtures, versioned reason mapping, accepted-
equivalent reconciliation, and no provider dependency. **Exact spec language:**
D71-R1, R4, R6–R7, R13–R16; AC1, AC5–AC6, AC13–AC19, AC24–AC28.

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes.** **What could go wrong:** a server adds status variants
to the old candidate array, old clients render them as radios, or rollback loses
the ability to interpret responses. **Why it matters:** mixed versions could offer
unqualified content or crash the chooser. **Severity: Critical. Likelihood: High**
under a naïve enum expansion. **Decision effect:** requires an additive separated
member and reader-first cohort rollout. **Permanent fix:** qualified candidate
schema remains unchanged, statuses use a noncandidate member/discriminant, old-
client fixtures, presentation-only kill switch, and reader-compatible rollback.
**Exact spec language:** D71-R3–R5, R14–R16; AC2–AC10, AC24–AC26.

### 21. Testability, traceability, and proof

**Material concern: Yes.** **What could go wrong:** a screenshot may look correct
while arrow navigation includes unavailable rows, focus falls to body, hidden
heads affect counts, or retries duplicate work. **Why it matters:** visual tests
miss the actual user/domain/security outcomes. **Severity: High. Likelihood:
High** without explicit criteria. **Decision effect:** creates D71-R1–R16 and
AC1–AC28. **Permanent fix:** positive/negative/boundary/auth/concurrency/mixed-
version/performance/a11y/production-shaped tests plus complete artifact
traceability and representative staff tasks. **Exact spec language:** D71-R16;
AC1–AC28.

### 22. Other development hazards

**Material concern: Yes.** **What could go wrong:** ADR Accepted may be mistaken
for runtime authority, a missing UI helper may be treated as design proof, Option
2 may silently appear on mobile/load, or implementation may freeze a page cap/
table before D68/D70 design. **Why it matters:** product behavior drifts before
dependencies are settled. **Severity: High. Likelihood: High.** Current OpenSpec
omits D67–D71 and Phase 23 remains blocked. **Decision effect:** D71 stays docs-
only and explicitly gates implementation. **Permanent fix:** record ADR/log/
glossary now, consolidate OpenSpec after the next decision set, require measured
activation proof, and treat failure as a governed amendment—not option drift.
**Exact spec language:** D71-R13–R16; AC1, AC24–AC28.

## Exact normative requirements

### D71-R1 — Closed server disposition

For the exact target/action/viewer context, every private/public head MUST resolve
internally to qualified, proved unavailable, qualification unknown, or not
disclosable. Callers/providers MUST NOT assert that outcome.

### D71-R2 — Whole-projection state is separate

Loading, offline, timeout, or complete projection failure MUST remain D69's one
chooser-level state and MUST NOT manufacture per-head unknown rows from stale or
partial data.

### D71-R3 — Qualified-only candidate semantics

Only qualified heads MAY enter candidate deduplication and the unselected
RadioGroup. Unavailable/unknown heads MUST NOT have radio, disabled, selectable,
row-click, roving-focus, or candidate semantics. Cross-head status dedupe MUST NOT
hide distinct public/private meaning.

### D71-R4 — Visible semantic list

After the qualified RadioGroup, authorized unavailable/unknown heads MUST render in
one neutral **Unavailable source versions** section with an ordinary semantic
`ul`/`li` list in canonical D68 locale/head order. Static rows MUST NOT be alerts,
live/status regions, or selection cards.

### D71-R5 — Exact identity and same snapshot

Rows/actions MUST bind trusted Tenant, environment, Site, stable resource,
source/target locale/profile, Copy action, capability epoch, head kind, exact
revision/canonical digest, source-contract digest, lifecycle/safety, and one
authorization/head snapshot shared with qualified candidates and paging. Page and
search MUST authorization-filter locale groups before head disposition; a group
with at least one displayable status head MUST remain even when it has no
qualified candidate, and candidate-only paging MUST NOT discard it.

### D71-R6 — Bounded safe reason vocabulary

One versioned source-owner/D70 mapping MUST produce only source-repairable, not-
staff-repairable, no-meaningful-effect, or qualification-unknown display families
and the ADR-0192 copy. Free-form provider/internal/security detail MUST NOT render.

### D71-R7 — Cause-owned action

Each row MAY show at most one 44-pixel-minimum independently authorized action.
Private/public/platform/zero-effect/unknown causes MUST expose only ADR-0192's
accurate action or none; public copy MUST NOT imply mutation of an immutable head.
Each repeated control's accessible name MUST contain its visible action plus the
full locale and head kind.

### D71-R8 — Authorization and non-enumeration

Authorization MUST filter before projection, ordering, aggregation, pagination,
reason/action mapping, and timing. A not-disclosable head MUST be
indistinguishable from no head through every response/UI/log/cache path. V1 MUST
display no unavailable count.

### D71-R9 — D70-owned recovery

Check again MUST reauthorize and reuse the exact D70 evidence-work identity,
coalescing, accepted server rate/backoff, and lost-response reconciliation. It
MUST create no D71 job, ledger, timer, poller, offline queue, or workflow.

### D71-R10 — Temporal and action safety

Every action MUST recheck the exact head/context/permission/lifecycle/safety at
use and prove the displayed revision is still the applicable current D12/D1 lane
head. Stale or superseded actions MUST perform no evaluation or handoff, MUST
never substitute a successor, MUST refresh unselected, and MUST disclose only
**Source availability changed**. Source handoff return MUST refresh fresh and
unselected.

### D71-R11 — Focus and announcements

One initially empty aggregate polite/atomic status MUST announce user-triggered
recovery outcomes exactly once. Static rows MUST not announce on render. A
remaining action retains focus; a disappearing focused row/action moves focus to
the persistent **Source version** heading; newly qualified radios remain unselected.
Selected-candidate loss follows D69/D70's stronger blocking recovery.

### D71-R12 — No-qualified state

With zero qualified heads, Core MUST omit the RadioGroup and Create action, show
**No source versions can be copied right now**, retain authorized status/recovery
rows, and render **Start {target locale} blank draft** as the primary Sheet-footer
action beside secondary Back and Cancel. It MUST invoke D69's existing command
directly without another confirmation and remain distinct from authoritative
empty, unauthorized, offline, and query failure.

### D71-R13 — Base Maia, responsive, and bounded reads

D71 MUST reuse exact Base Maia/Base UI Field/Radio/Item/Sheet/Button conventions,
semantic tokens, native list semantics, non-clamped essential text, one scroll
region, safe footer, wrapping mobile actions, accepted `lang`/`dir`/bidi
isolation, semantic `time[datetime]`, localized absolute time, explicit timezone,
and full-context action names. Candidate/status projection MUST
remain one batched D68–D70 read inside D69's p95 300 ms budget with no count,
body/diff/history N+1, polling, remote work, or shared/public cache.

### D71-R14 — No new state or adjacent authority

D71 MUST persist no row/status/cache/workflow/task/issue/notification/audit/
capability and introduce no table/grant/RLS/view/function/RPC. It MUST have no
public runtime, serving, Vercel, route, search, Giving, currency, Stripe, message,
receipt, document, or payment authority.

### D71-R15 — Mixed-version and rollback safety

Qualified candidates and authorized status rows MUST occupy separate additive
typed response members with nonoverlapping discriminants. Old compatible clients
MUST safely consume only qualified candidates. Rollout MUST be reader-first and
cohort-bounded; a presentation kill switch MUST affect no D68–D70 truth/effect.

### D71-R16 — Dependency, proof, and traceability gate

Activation MUST require accepted D12/D22/D32 equivalents, D67–D71, consolidated
Phase 24 OpenSpec, exact Base UI/Payload conformance, hostile authorization/
concurrency/mixed-version/performance/a11y proof at the Site Locale owner's
maximum supported catalog—including two status-only heads per visible locale—and
representative ministry-editor evidence. Every artifact MUST use the same names,
states, counts, owners, copy, and boundaries.

## Falsifiable acceptance criteria

1. **AC1 — Current-state truth:** current `develop` exposes no D71 behavior;
   documentation authorizes no runtime/schema/provider change.
2. **AC2 — Qualified private:** a qualified private head appears only as an
   enabled, unselected radio with complete D69 identity.
3. **AC3 — Qualified public:** a qualified public head appears only as an
   enabled, unselected radio with complete D69 identity.
4. **AC4 — Proved-unavailable private:** it appears only in the status list with
   permitted private wording/action and never in radio accessible set membership.
5. **AC5 — Proved-unavailable public:** it uses immutable-public wording and never
   implies the current published revision is editable.
6. **AC6 — Qualification unknown:** it says availability could not be checked,
   never claims content loss/invalidity, and exposes only authorized Check again.
7. **AC7 — Not disclosable:** hidden/nonexistent heads are indistinguishable in
   response, rows, placeholders, counts, timestamps, actions, errors, logs, cache,
   and avoidable timing.
8. **AC8 — Whole-projection failure:** D69's one query-failure experience renders;
   no per-head rows/reasons arise from stale or partial data.
9. **AC9 — Qualified-only dedupe:** equal qualified heads dedupe per D69; an
   unavailable/unknown public head never hides a qualified private sibling.
10. **AC10 — Distinct statuses:** private/public unavailable/unknown heads are not
    incorrectly cross-head deduped when meaning or action differs.
11. **AC11 — Zero qualified:** no empty RadioGroup or disabled Create renders;
    truthful no-copy copy and permitted rows remain; **Start {target locale}
    blank draft** is the direct primary Sheet-footer action beside Back/Cancel.
12. **AC12 — Start blank:** every unavailable/unknown/global-failure/offline state
    preserves D69's authorized Start blank path without another confirmation.
13. **AC13 — Identity and text:** each disclosed row exposes permitted full locale,
    head kind, public/private state, localized absolute time/timezone, status, and
    full wrapping reason; locale text uses accepted `lang`/`dir`/bidi isolation,
    timestamps use semantic `time[datetime]`, and repeated actions include full
    locale/head context in their accessible names; author/raw codes remain absent.
14. **AC14 — No V1 count:** UI/DTO exposes no unavailable total, badge, hidden
    count, or partial completeness claim.
15. **AC15 — Reason mapping:** each of the four safe display families produces
    exactly ADR-0192's copy and no provider/internal/security text.
16. **AC16 — Private repair:** Open source draft appears only for an exact source-
    repairable private head and independently authorized editor context.
17. **AC17 — Public successor:** Open source editor never edits the immutable
    publication, accurately creates/opens a successor context, and preserves exact
    target-return intent.
18. **AC18 — No false action:** platform/not-staff-repairable and zero-effect rows
    expose no misleading row action; global Start blank remains singular.
19. **AC19 — Recheck idempotency:** duplicate click, two tabs, retry, and lost
    response converge on one D70 evaluation identity under server rate/backoff;
    no D71 work record exists.
20. **AC20 — Stale action:** superseded head, changed contract, access/safety/
    lifecycle loss, or forged destination creates no evaluation/navigation/effect
    and reveals no new detail; the server proves the displayed revision remains
    the current applicable lane head and never silently substitutes a successor.
21. **AC21 — Dynamic result:** newly qualified radio enters canonical order
    unselected; unavailable/unknown retention keeps focus/action and announces
    exactly one result; access loss uses only generic changed wording.
22. **AC22 — Focus recovery:** removal of a focused row/action moves focus to the
    persistent **Source version** heading, never body/live region/arbitrary radio;
    nonfocused metadata refresh never moves focus.
23. **AC23 — Selected loss:** a selected candidate that becomes unavailable clears
    per D69/D70 blocking recovery, focuses the exact persistent cause, and creates
    nothing.
24. **AC24 — Same bounded snapshot:** candidates/statuses/order/page cursor come
    from one viewer/action snapshot and one batched read with no count/body/diff/
    history/N+1/polling/remote/shared cache; p95 stays within 300 ms at measured
    maximum catalog. A locale with only authorized status heads survives paging;
    the maximum proof includes two unavailable/unknown heads for every visible
    locale and no qualified candidates.
25. **AC25 — Old client:** compatible old clients ignore the additive status
    member, receive only qualified candidates, and cannot deserialize a status as
    a radio choice.
26. **AC26 — Kill/rollback:** disabling D71 presentation removes only status rows/
    actions and preserves qualification, candidates, evidence, target, Basis,
    receipt, D70 work, and compatible readers.
27. **AC27 — Accessible/responsive journey:** keyboard, arrow, Tab/Shift+Tab,
    screen reader, touch, visible focus, forced colors, reduced motion, 320 CSS
    pixels/400% reflow, long/CJK/RTL/bidi, mobile safe footer, offline, weak-
    network, and JavaScript-failure tests pass with no clamped essential text.
28. **AC28 — Representative user proof:** at least five occasional/frequent
    ministry editors, including disabled/mobile use, distinguish qualified,
    unavailable, unknown, private/public, source repair, and Start blank without
    coaching or critical error; maximum-list density causes no missed qualified
    choice.

## Required monitors

| Signal                                                    |           Threshold | Owner                     | Required response                                                                                                                                                  |
| --------------------------------------------------------- | ------------------: | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `translation_copy_d71_unqualified_candidate_render_total` |                 Any | Web Studio + CMS Platform | Disable the affected chooser cohort, preserve Start blank, inspect disposition/candidate separation, and re-prove qualified-only DTO/radio semantics.              |
| `translation_copy_d71_status_disclosure_total`            | Any confirmed event | Security + Web Studio     | Remove the status member/list, purge private caches, inspect scope/count/error/timing paths, and restore only after hostile non-enumeration proof.                 |
| `translation_copy_d71_disposition_render_mismatch_total`  |                 Any | Web Studio + CMS Platform | Remove incorrect status/copy, show whole-query or qualification-unknown truth as applicable, repair versioned disposition mapping, and re-prove all four outcomes. |
| `translation_copy_d71_reason_action_mismatch_total`       |                 Any | Source owner + Web Studio | Suppress the affected action while retaining permitted neutral status, repair reason/action ownership, and reauthorize before restoration.                         |
| `translation_copy_d71_stale_head_action_effect_total`     |                 Any | CMS Platform + Security   | Disable status recovery, reconcile the exact D70 work identity, inspect CAS/authorization/destination construction, and prove stale actions are no-effects.        |

D69's picker latency/disclosure/partial-commit/unknown-result signals and D70's
qualification backlog/evidence disagreement/save-interference signals remain
governing. D71 does not duplicate them.

## Ruthless synthesis and execution order

### Must be resolved before recording

Resolved in ADR-0192 and this review:

1. Define four exact server dispositions and keep whole-query failure separate.
2. Keep unavailable/unknown content outside radio semantics in one visible list.
3. Bind safe copy/actions/retry/focus to exact head, viewer, target, and owner.
4. Add no count, state, workflow, second query, poller, or component system.
5. Preserve additive old-client safety and all D68–D70 authority.

### Must enter consolidated Phase 24 OpenSpec/design before ticketing

1. D71-R1–R16 and AC1–AC28.
2. The purpose-shaped response members/discriminants, complete context identity,
   reason/action mapping, same-snapshot page/search contract, and old-client
   fixture—without freezing a D71 table because none exists.
3. Base Maia labelled RadioGroup plus native-list/Item composition, non-clamp behavior,
   pending control, aggregate status, exact focus targets, mobile stacking, and
   no-count UI.
4. Check-again source-owner command, rate/backoff/idempotency/reconciliation,
   source handoff/return, authorization, RLS/grants/privileged parity, cache, and
   redacted observability.

### Required implementation safeguards

1. Land/verify D68–D70 owners and the additive separated projection before UI.
2. Prove hidden/nonexistent equivalence, four-way mapping, old-client omission,
   qualified-only dedupe, and stale-action no-effect at the server seam.
3. Implement the one Base Maia Sheet journey; test DOM/accessible/visual order,
   dynamic focus, exactly-one announcements, zero-qualified, and no clamp.
4. Prove one-query/page performance and maximum-list density under weak network,
   then run representative ministry-editor tasks.
5. Activate by cohort; any zero-tolerance monitor disables only the affected D71
   presentation/action while preserving qualified choices and Start blank.

### Monitor after release

Only the five D71 signals above and inherited D69/D70 signals qualify for monitor
status because each has a signal, threshold, owner, and response. Disclosure,
unqualified radio render, wrong disposition/copy, wrong recovery, or stale action
effect are incidents, not accepted residual behavior.

## Final disposition

**Accept with required amendments.** Option 1 is the best current choice. It
preserves recent-work discoverability and cause-owned recovery while maintaining
one clean selectable RadioGroup, exact permissions, and low architectural cost.
The accepted answer is the ADR-0192 four-way server disposition, qualified-only
choices, visible neutral semantic list, bounded safe reasons/actions, D70-owned
idempotent recovery, deterministic focus, no-count V1, one batched projection,
and additive state-free rollout.

No runtime, schema, migration, Supabase policy, Payload/Vercel setting, merged
OpenSpec, ticket, or deployment changed. Implementation remains gated on accepted
dependencies, consolidated Phase 24 OpenSpec, exact provider/Base UI
conformance, measured maximum-catalog proof, accessibility, and representative
ministry-editor evidence.
