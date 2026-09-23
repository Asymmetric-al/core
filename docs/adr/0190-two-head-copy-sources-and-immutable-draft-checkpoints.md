# ADR-0190: Two exact Copy source heads and immutable draft checkpoints

**Status:** Accepted (founder ruling after required amendments, Phase 24 D69 —
2026-08-30)

## Context

Phase 24 D68 established an explicit, unselected **Copy from…** chooser and made
Site source ordering a staff convenience only. It did not decide which revision
of an eligible source locale may seed a private target. The founder selected the
latest saved draft plus the current published version so localization can proceed
in parallel without forcing premature source publication.

That short answer is unsafe if “latest draft” means Payload's moving provider
alias. The installed Payload build can return the latest published version from a
`draft: true` read when no newer draft exists, coalesces autosave into mutable
recovery storage, permits publication-incomplete drafts, and requires separately
qualified version access. Proposed Phase 23 D12 instead defines one exact server-
acknowledged Working Revision, while proposed D1 owns the current public source
revision and D67 requires immutable Translation Basis evidence. Those owners—not
Payload status or version-list order—must define the candidates.

Current Core has Payload drafts, 300 ms autosave, a visible Save Draft action,
and staff labels including **Private draft**, **Draft ahead**, and **Published**.
It has no accepted D12 Working Revision implementation, exact-locale Copy
chooser, D1 locale source head, Translation Basis, or D69 candidate projection.
Phase 23 PR #1340 remains open and blocked, so this ADR records intended behavior
and authorizes no implementation.

## Decision

For each source locale already admitted by D68's exact action/viewer eligibility,
the resource source owner may project at most two distinct **Copy source
candidates**:

1. **Latest saved draft** — the exact current server-acknowledged D12 Working
   Revision, when it has a distinct versioned copy-manifest input and passes the
   ADR-0191 Copy Qualification contract.
2. **Current published version** — the exact current immutable source revision
   supplied by D1's authoritative public generation/release owner, when it also
   passes ADR-0191 Copy Qualification.

These are logical heads, not Payload queries or stored D69 rows. The private
candidate exists whether its exact acknowledgement came from autosave or **Save
now**. Browser-only, debounced, queued, in-flight, outcome-unknown, conflicted,
superseded recovery/autosave, scheduled-only, release-only, rejected, restored-
history, arbitrary historical, or provider “latest” versions are never
candidates. A schedule attached to a Working Revision is a separate fact and
does not create a third option.

Core independently qualifies each exact private/public head before deduplicating
enabled candidates by versioned copy-manifest input identity. If both the Working
Revision and current public source qualify and resolve to the same compatible copy
input, Core shows one **Current published version** candidate and explains that
the saved draft has no newer copyable changes. An unknown/unqualified public head
never hides a qualified equal-input private head. A Payload `draft: true` result
is never proof that a distinct private candidate exists. A withdrawn, superseded,
or merely historical publication is not renamed current.

Nothing is preselected. D68 orders locale groups; within one locale, a distinct
private candidate appears before the public candidate without recommended or
preferred styling. A selected candidate reference, kind, head, revision, digest,
and timestamps are untrusted input to the final command, never authority or a
moving alias.

### Copy effect

One resource-owned **Start translated target from source** command takes the
target locale, selected exact candidate reference, expected selected source-lane
head, expected target absence/head, and semantic idempotency key. Trusted server
context derives the actor, Tenant, environment, Site, stable resource, source
locale, target locale, capability epoch, and time. The command reauthorizes the
exact private-version or published-source read plus target creation; rechecks
source/target lifecycle, safety, schema/profile and copy-manifest compatibility,
permitted stable references, the selected source-lane head and eligibility, and
target absence/head; and accepts no caller/provider scope or status as proof.

If the selected source-lane head or another fact that determines that candidate's
eligibility changes after display, the command creates nothing and never silently
substitutes the newer head or falls back to history. A change confined to the
unselected source lane does not invalidate an otherwise exact selected
candidate. A refreshed chooser is unselected. A concurrent Start blank/Copy for
the same target has one structurally unique winner; an authorized loser may open
the existing draft but cannot overwrite it.

For a private candidate, the source owner freezes or reuses an immutable,
retention-protected **Copy Source Checkpoint** for the exact acknowledged Working
Revision before it can become a D67 Basis. Exactly one checkpoint exists for one
complete same-scope immutable copy-input identity (source revision plus compatible
manifest/canonicalization identity); concurrent targets reuse it. A rolling/
replaced Payload autosave row is never referenced directly. The checkpoint does
not acquire or transfer
the source Active Editor Lease, edit source content, publish, notify, or create a
second working head. It is a source-owned meaningful checkpoint and minimum
referential evidence, not a D69 version store.

The accepted adapter must atomically commit the checkpoint where needed, one
private target Working Revision, **Translated** provenance, exact Translation
Basis, content-free audit, idempotency receipt, and target-creation result—or
commit none. No provider/network call occurs while locks are held. If the
accepted owners cannot prove that atomic boundary, private-draft Copy remains
disabled rather than gaining a compensating saga or orphan-repair workflow.

The copy contains only values and currently permitted stable references in the
versioned source-owned localization/copy manifest. It never transfers public
state, review/approval, readiness, schedule, route, path, public alternative,
safety disposition, assignment, Active Editor Lease, source capability, source
validation result, or provider metadata. The target validates independently and
remains private. Later source changes use D67 and never overwrite the target or
historical Basis.

ADR-0191 applies uniformly to private and public candidates. At most one durable,
immutable, content-free completed source-input evidence result binds each exact revision/
digest and collision-resistant versioned source-contract digest covering the
retained schema, resource/copy profile, manifest, canonicalization, qualifier,
block/node/package versions, limits, and material-effect contract. A source-owned
post-acknowledgement hook normally requests or reuses it without delaying Save or
changing D12's side-effect-dark effect; a retained-reader/digest-
qualified legacy D1 current publication may receive the same source-owned
evidence, while future D1 publication reuses it. Missing/in-progress/failed work
is retryable unknown, not evidence; Check again idempotently requests the same
identity through the source owner's accepted durable-work mechanism. Pending work
coalesces to current D12/private, current D1/public, and revisions referenced by a
retained D69 Copy Source Checkpoint/Basis; superseded unretained private autosaves do not consume an unbounded queue
or mutate completed proof. Candidate
projection composes that source
evidence with the exact target locale/profile and batched live authorization/
lifecycle/safety/reference facts. It never treats Save,
Payload validation/status, source findings, or publication as qualification.
After selection, this command reads the exact body, verifies digest/versions/
limits, reruns complete lossless qualification and every transferred-reference
check, and only then writes. Unknown input, silent loss, zero source effect, or
unknown qualification creates no Translated target.

Known source-owned **Details to finish**, **Suggestion**, or **Technical issue**
findings remain visible but non-gating when qualification is independently
proved. Partial/unavailable checks stay explicitly unknown. Finding-summary
changes alone do not stale the selected source or enter its Basis, receipt,
audit, or target findings. The target derives its own exact-locale findings.

### Publication boundary

A private Working Revision enables parallel authoring but is not an authoritative
public-source publication. D67 permits public freshness to derive only from the
current authoritative source publication. Therefore a target copied from a
private candidate gains no publication eligibility from D69 and cannot first
publish as **Translated** while its Basis is supported only by private source
evidence.

The blocker clears when D1's current authoritative source publication pins the
same exact source revision represented by the checkpoint under the same
compatible copy-manifest/canonicalization identity. If a different source
revision becomes current, the target must use D67's existing compare/update or
**Confirm translation is still current** successor path to establish a reviewed
Basis against that publication.
This adds no fourth freshness state, embargo workflow, or second approval. Until
an accepted successor changes this governing boundary, private-draft-sourced
targets stay private.

### Authority and data invariants

- D12 owns the current server-acknowledged Working Revision, Active Editor Lease,
  acknowledgement receipt, meaningful checkpoints, and retention behavior.
- D1/public generation owns the exact current published source revision.
- The resource profile/manifest owner owns structural copy compatibility and the
  finite values/references that may copy.
- D68 ranks eligible source locales only.
- D69 projects the two candidate kinds and the private-start command consequence;
  it owns no candidate table, status, preference, or version history.
- D67 owns Translated provenance, Translation Basis, freshness, comparison, and
  the public-source review boundary.
- Public Site Generation remains the sole favorable serving authority.

Every durable checkpoint, target, Basis, audit, and receipt uses complete same-
Tenant/Site/stable-resource scope, distinct source/target locale, immutable exact
revision identity, compatible versioned manifest/profile and digest, restrictive
deletion, trusted actor/time, and purpose-shaped indexes. Exactly one Basis must
belong to every Translated target revision, and no Basis may belong to an
Independently authored or Legacy revision. Referenced source evidence cannot be
pruned or hard-
deleted while required; an owning legal-erasure contract may replace content with
minimum non-content tombstone evidence and make freshness **Could not be
checked**, but never leave a dangling or falsely current Basis.

D69 adds no generic settings row, candidate materialization, mutable `is_latest`,
raw version-history permission, target/source matrix, workflow state, background
job, task, notification, translation vendor, machine translation, resolver,
public fallback, Vercel mutation, Stripe behavior, Giving effect, currency
behavior, or new Phase 12 capability.

Candidate enumeration occurs through one purpose-shaped server read model. It
filters before projection and reveals no private-candidate existence, timestamp,
status, author, title, count, or error distinction without exact current
authority. `sites.manage_locales`, public read access, Payload access, D68 order,
AI, caller input, and source locale visibility grant none. Actor-scoped Payload
Local API calls use current user context, `overrideAccess: false`, exact version
access, and fallback disabled; no raw `readVersions` grant is introduced merely
for Copy.

Operational relations use minimum grants and applicable ENABLE/FORCE RLS,
operation-correct old-row `USING` and new-row `WITH CHECK`, security-invoker
views, hardened security-definer functions with empty `search_path`, qualified
objects and minimum execute grants, indexed predicates, and direct-DML poison
tests. Browser, `anon`, authenticated direct DML, service/secret application,
Payload-bypass, generic worker, importer, and AI paths cannot manufacture a
candidate, checkpoint, target, or Basis outside the command. Current deployment
is isolated one environment per Supabase project/database; D69 adds no partial
environment column.

## Staff experience

Choosing D68's **Copy from…** opens one Base Maia/Base UI Sheet:

- Title: **Copy into French (Canada)**
- Description: **Choose the version to copy. Core will create a private French
  (Canada) draft. Nothing will be published.**
- Field label: **Source version**
- Instruction: **Select one saved version to continue.**

When the Sheet opens, Core focuses its title using `tabIndex="-1"`; pressing Tab
then enters the first unchecked radio without selecting it. Closing returns focus
to **Copy from…**.

The Sheet uses one unselected Base UI RadioGroup for the complete mutually
exclusive candidate set. D68's **Suggested for this Site** and **Other available
sources** sections retain their locale order. Locale headings are semantic visual
groups, not separate keyboard radio groups. Every radio's visible and accessible
name contains full locale, version kind, and public/private state; status/time are
associated descriptions. Full autonym, staff-language name, canonical code,
`lang`, `dir`, and bidi isolation follow D68.

For one distinct source locale:

**English (United States) · en-US**

- **Latest saved draft** — **Not public · Has unpublished changes** — **Saved 30
  Aug 2026, 14:32 ICT**. Helper: **Use the latest work saved to Core. The French
  (Canada) draft stays private until this source is published or reviewed against
  the published English version. Only changes saved to Core will be copied;
  editing may still be in progress.** This generic caveat never reveals whether
  another editor is active.
- **Current published version** — **Published** — **Published 26 Aug 2026, 09:15
  ICT**. Helper: **Use the version visitors currently receive from this source.**

The two-row example uses **Has unpublished changes** because a current published
sibling exists. A never-published private-only source instead says **Not public ·
Never published**; it never implies a prior publication baseline.

When ADR-0191 source findings exist, the row's associated description calmly
adds **Has details to finish**, **Has suggestions**, or both. Partial coverage
retains known classes and adds **Some source editing checks are unavailable**;
complete outage says **Source editing checks are unavailable**. It explains:
**You can still copy this source version. The new French (Canada) draft will be
checked separately.** It never says Ready, Passed, No issues, or Ready to
publish. Optional detail/handoff appears only after selection, outside the radio
label, uses a source-owner/head-accurate action, and is never required to Copy.
ADR-0192/D71 owns the separate visible unavailable-source-head presentation;
such a head never enters this RadioGroup.

Timestamps use the staff UI's localized absolute format plus explicit timezone;
relative time may supplement but never replace it. Author identity is absent by
default and appears only through an independently permitted D12 collaborator
projection. **Published** is not relabelled **Live**. Color, badge, position, or
time is never the only state signal.

When the two heads have the same versioned copy input, the only row is **Current
published version — Published** with **The saved draft has no newer copyable
changes.** A never-published source may show only the private candidate; a source
with no distinct private input shows only the public candidate. Even one row
remains unselected.

If the accepted D12 source comparison already exists, two distinct rows may
offer one quiet **Compare draft with published** action. It loads on demand,
preserves selection, restores focus to its trigger, and is never required to
Copy. Preview/diff failure does not invalidate an otherwise eligible candidate.
D69 creates no second comparison engine.

The footer contains **Back**, **Cancel**, and disabled-until-selected **Create
French (Canada) draft**. There is no second confirmation dialog. After selection,
the footer summary says **From English (United States) · latest saved draft ·
saved 30 Aug 2026, 14:32 ICT**. Submission says **Creating French (Canada)
draft…**, disables repeat submission, and preserves the selection.

Success navigates to the target editor and places a persistent receipt near its
locale/status header, not only a toast: **French (Canada) draft created from
English (United States) — latest saved draft from 30 Aug 2026, 14:32 ICT.
Created as a private draft.** The public-source variant says
**current published version**. The receipt remains immutable business history.

A separate derived read-only message near target readiness says **Based on a
private English (United States) draft. Publishing remains unavailable until this
exact saved source revision is the current published source, or you review this
translation against the current published English version.** It changes or
clears when D67 proof changes and offers the existing D67 compare/review action
when the viewer is authorized. Otherwise it says **This translated draft is based on
private source work. Publishing remains unavailable until the source is
published or an authorized reviewer confirms it against the current public
source.** It then uses the existing non-enumerating handoff. This is not a
freshness state, task, notification, or approval.

Focus moves to the target editor heading because creation advances the workflow.
After committed creation, the target editor invokes D12's ordinary target Active
Editor Lease acquisition against the returned target head. If this session wins,
editing begins; if another session already holds the lease, Core opens D12's
truthful read-only/collaboration state and handoff without retrying Copy,
deleting the target, or changing the successful receipt. D69 never transfers or
acquires the source lease and does not create a second lease model.

Truthful exceptional states are:

- loading: **Loading saved source versions…** once in a polite status region;
- authoritative empty: **No saved source versions are available to you. Go back
  to start French (Canada) from a blank draft.**;
- query failure: **We couldn't load saved source versions. Nothing was created.
  Try again or go back to start blank.**;
- offline: **You're offline. Reconnect to load or copy a source. Nothing was
  created.**; no offline queue;
- stale private head: **The saved draft changed while you were choosing. Refresh
  and choose again. Nothing was created.**;
- stale public head: **The published version changed while you were choosing.
  Refresh and choose again. Nothing was created.**;
- permission/safety loss: **Your access changed. This source can't be copied.
  Refresh the list or choose another source.**;
- target race: **French (Canada) has already been started.** with **Open existing
  draft** when still authorized;
- unknown create result: **Checking whether the French (Canada) draft was
  created…**; resolve the same receipt before enabling another request;
- proved failure: **We couldn't create the French (Canada) draft. Nothing was
  created. Try again.**; preserve an otherwise current selection.

A stale refresh clears selection and politely says why; it never selects the
replacement. If a focused candidate disappears, focus moves to the persistent
cause message and next valid action. Escape/Cancel returns to **Copy from…**;
Back returns to the unselected Start choice; comparison returns to its trigger.
Waiting/success use polite status, blocking submission errors use one persistent
focus-linked alert, and metadata refreshes do not chatter.

The complete row label provides Core's 44×44 primary touch target. The Sheet is
full-width/single-column on mobile, has independently scrollable content and a
safe-area-aware reachable footer, and never requires hover, swipe, horizontal
table, or nested overlay. DOM/visual/keyboard order agree. It passes keyboard,
screen reader, touch, forced colors, reduced motion, 320 CSS pixel/400% reflow,
long/CJK/RTL/bidi, weak-network, and JavaScript-failure proof.

## Failure, performance, migration, and rollout

Candidate metadata resolves on demand with D68 through one bounded preference
read, immutable D70 evidence, and one batched source-head/authorization/
lifecycle/reference query. No per-locale N+1, candidate-body, diff, version-
history, remote, or public-cache work is allowed. Exact body/preview/diff loads
only after explicit authorized selection/action; the final command reruns D70
proof before writing. Private evidence, metadata, and content are `no-store`,
never placed in a public/Vercel/shared or persistent browser cache. No remote
call occurs under database locks.

Known command failure creates nothing. Lost acknowledgement performs receipt
lookup/replay with the identical idempotency key before any successor write.
Same key and meaning returns the original result; changed meaning conflicts.
Source and target locks follow one accepted deterministic order. If checkpoint,
target, Basis, audit, and receipt cannot commit atomically, private Copy stays
off. Optional comparison failure affects comparison only.

Migration creates no D69 candidate rows and infers nothing from provider version
order, `_status`, autosave flags, timestamps, English/default locale, schedule,
or history. Only accepted D12/D1 heads with qualified exact revision identity may
project. Mixed-version rollout lands the bounded read/degradation path and
published candidate first, proves private checkpoint retention and atomicity,
then enables private candidates by cohort. A private-lane kill switch removes
only that candidate; Start blank and eligible published Copy remain. Rollback
stops the private writer/offer but preserves every existing immutable checkpoint,
target, Basis, audit, and receipt. Compatible readers, provenance display, the
derived publication blocker, and D67 remediation remain available until every
retained target is understood by a compatible successor. Rollback is writer-off/
roll-forward only; Core never deploys an older reader that cannot interpret
checkpoint provenance. No history is downgraded or rewritten.

Activation requires accepted Phase 23 D1/D12/D22/D32 equivalents, D67-D71, one
consolidated Phase 24 OpenSpec delta, exact
Payload-pin conformance, provider-neutral contract tests, representative
ministry-editor usability proof, and production-shaped security/concurrency/
performance evidence.

## Consequences

- Staff can translate upcoming content in parallel without publishing the source
  prematurely.
- The chooser remains bounded to two meaningful heads and no Site setting.
- A private copy creates durable provenance without turning recovery autosave or
  Payload status into product authority.
- Private planned source meaning cannot become public through a translated target
  before D67's public-source proof.
- The price is one immutable checkpoint/retention obligation and explicit stale-
  head recovery. Published-only remains available whenever private proof is not
  qualified.

## Rejected alternatives

- **Current published version only:** strongest simplicity fallback, but forces
  serial localization and can encourage premature source publication.
- **Per-Site draft visibility policy:** adds divergent behavior and settings
  without tenant evidence while retaining every private-lane safeguard.
- **Arbitrary version history picker:** exposes recovery/provider history,
  broadens permission and retention, and creates a second version-management UX.
- **Mutable latest pointer or silent retarget:** makes the actor's choice and
  Basis nondeterministic.
- **Copy without checkpointing:** permits autosave coalescing/pruning to destroy
  historical provenance.
- **Publish from private-only source evidence immediately:** conflicts with D67
  and can expose planned source meaning before its authoritative owner publishes
  it.

## References

- [ADR-0188 — Retain reviewed translations across ordinary source drift](./0188-retain-reviewed-translations-across-source-drift.md)
- [ADR-0189 — Site suggested translation sources are authoring-only](./0189-site-suggested-translation-sources-are-authoring-only.md)
- [ADR-0191 — Revision-bound Copy qualification](./0191-revision-bound-copy-qualification-with-non-gating-source-findings.md)
- [Phase 24 D69 adversarial review](../prds/sitestacker-parity/phase-24-d69-two-head-copy-sources-adversarial-review.md)
- [Payload Versions](https://payloadcms.com/docs/versions/overview)
- [Payload Drafts](https://payloadcms.com/docs/versions/drafts)
- [Payload Autosave](https://payloadcms.com/docs/versions/autosave)
- [Payload Local API access control](https://payloadcms.com/docs/local-api/access-control)
- [Sanity Drafts](https://www.sanity.io/docs/content-lake/drafts)
- [Sanity Perspectives](https://www.sanity.io/docs/content-lake/perspectives)
- [Contentful locale-based publishing](https://www.contentful.com/help/localization/locale-based-publishing/)
- [Salesforce CMS version history](https://help.salesforce.com/s/articleView?id=sf.cms_content_versionhistory.htm&language=en_US&type=5)
- [Blackbaud active-page version guidance](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/lo/content/content_pagebuilder2_pages_editing_content_active_page.html)
- [W3C grouping controls](https://www.w3.org/WAI/tutorials/forms/grouping/)
- [WAI Radio Group Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)
- [WCAG 2.2 status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [WCAG 2.2 target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
