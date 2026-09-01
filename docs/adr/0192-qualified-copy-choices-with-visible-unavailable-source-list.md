# ADR-0192: Qualified Copy choices with a separate visible unavailable-source list

**Status:** Accepted (founder ruling after required amendments, Phase 24 D71 —
2026-08-30)

## Context

ADR-0190 gives staff one unselected **Source version** RadioGroup containing at
most two exact Copy heads per eligible source locale. ADR-0191 then requires each
private or public head to pass effective Copy Qualification before it may become
an enabled choice. The founder selected a visible list immediately after those
choices so authorized staff can understand why recent or published work is not
selectable instead of believing it disappeared.

That direction is sound, but a disabled radio or client-inferred `is_copyable`
state would mix nonchoices into the RadioGroup, blur proved unavailability with a
temporary unknown, and risk revealing private source-head existence. Current Core
has no D69–D71 runtime, projection, or UI. Phase 23 PR #1340 remains open and
blocked, so this ADR records intended behavior and authorizes no implementation.

Modern guidance supports the boundary without dictating Core's exact product
design. W3C's radio pattern treats the group as mutually exclusive choices with
one composite keyboard entry; Base UI likewise requires Radio items to live
inside RadioGroup. W3C status-message guidance supports one noninterrupting live
announcement for asynchronous outcomes, not a live region on every static row.
GOV.UK advises against preselected radios and generally avoiding confusing
disabled controls. Drupal, Contentful, Payload, and Salesforce demonstrate that
version identity, publication state, timestamps, permission-shaped actions, and
translation status can remain visible without becoming one selectable workflow
state. Repository ownership and D68–D70 remain authoritative where provider
patterns differ.

## Decision

### One rebuildable Copy Source Disposition

For the exact D69 Copy action, one purpose-shaped D68–D70 server projection
independently resolves every private/public head before browser projection. It
binds trusted Tenant, environment, Site, stable resource, source locale, target
locale/profile, requested action, current capability epoch, head kind, exact
revision/canonical digest, source-contract digest, lifecycle, safety, and current
viewer authority.

Each exact head resolves internally to exactly one **Copy Source Disposition**:

1. **qualified** — may enter the enabled, unselected candidate set;
2. **proved unavailable** — may enter the authorized unavailable-source list
   with one bounded, content-free display reason family;
3. **qualification unknown** — may enter that list with distinct unknown wording
   and an authorized D70 recovery action when applicable; or
4. **not disclosable** — produces no row, placeholder, count, timestamp, reason,
   action, response distinction, or avoidable timing distinction.

This disposition is derived, action-specific presentation truth—not a row,
status Boolean, publication fact, workflow state, issue, or permission. Whole-
projection loading, offline state, or failure is not a head disposition. D69's
single loading/query-failure experience owns it and may not fabricate per-head
unknown rows from stale or partial data.

Only qualified heads enter D69 candidate deduplication and the RadioGroup. Equal-
input private/public heads collapse to the qualified public row only when both
qualify. An unknown or unavailable public head never hides a qualified private
sibling. Unavailable/unknown heads remain exact and are not cross-head deduped
because public/private meaning and valid recovery differ.

### Staff experience

The existing Base Maia Sheet keeps one persistent **Source version** heading,
which is also the visible and accessible label for one unselected Base UI
RadioGroup containing enabled qualified choices only. Immediately after that
group, when at least one authorized unavailable or unknown head exists, Core
renders a neutral section titled **Unavailable
source versions** with the description **These versions can’t be selected right
now.** The section uses an ordinary semantic unordered list in D68's canonical
locale/head order.

Each list item carries the same authorized identity cues as an enabled candidate:
full locale name and canonical code where needed for disambiguation, **Latest
saved draft** or **Current published version**, private/published state, and a
localized absolute saved/published time with explicit timezone. Time is
description, never the only state; author remains absent unless separately
authorized. Essential identity, reason, and recovery text wraps in full. Core's
current shared `ItemDescription` clamps by default, so the D71 composition must
use its supported non-clamped composition without forking the shared primitive.
Locale labels use the accepted `lang`, `dir`, and bidirectional-isolation
contract. Timestamps use semantic `time[datetime]`, a localized absolute
display, and an explicit timezone.

List items are never radios, disabled inputs, row-click targets, selectable
cards, alerts, status/live regions, or members of roving focus. A repo-native
implementation may compose the existing Base Maia `Item` content/action parts
over native `ul`/`li` semantics. It introduces no primitive, style, token, card
system, or app-local shadcn copy. The list uses neutral semantic tokens and text;
red/destructive styling, warning ceremony, or color-only meaning is prohibited.

Every displayed row has one status label and one bounded explanation:

- **Unavailable to copy — source-repairable:** **Some content in this version
  must be changed before it can be copied.** An independently authorized private
  head may offer **Open source draft**. An immutable public head may offer **Open
  source editor** only when editing creates a successor; it never implies the
  published revision itself is editable.
- **Unavailable to copy — not staff-repairable:** **This version can’t be copied
  right now. Choose another source version or start blank.** It offers no
  misleading tenant action.
- **Unavailable to copy — no meaningful effect:** **Nothing to copy. This version
  would not add content to the new {target locale} draft. Start blank instead.**
  It does not duplicate the global Start blank action inside the row.
- **Copy availability couldn’t be checked:** **We couldn’t finish checking this
  version.** It may offer **Check again** when the viewer and exact source owner
  permit D70 recovery.

One versioned source-owner/D70 mapping chooses the safe family and action intent.
Free-form provider errors, block names, IDs, schema/qualifier versions, hidden
counts, security detail, and the word **safe** never enter staff copy. Each row
has at most one cause-owned 44-pixel-minimum action. On narrow layouts content and
action stack without horizontal scrolling or truncation. Every repeated recovery
or handoff control has an accessible name containing its visible action plus the
full locale and head kind.

V1 shows no unavailable count: the list is already visible, while a count adds
completeness, staleness, and disclosure obligations without improving the
decision. If no qualified head exists, Core omits the empty RadioGroup and the
disabled Create action, says **No source versions can be copied right now**,
retains authorized status/recovery rows, and preserves D69's **Start blank** and
Back paths without another confirmation. **Start {target locale} blank draft** is
the Sheet's primary footer action beside secondary **Back** and **Cancel**, and
invokes the existing Start blank command directly. This state remains distinct
from authoritative empty, unauthorized omission, offline, and whole-query
failure.

### Recovery, focus, and announcements

Every recovery or source handoff first reauthorizes the current actor, exact
scope, action, head kind, and displayed revision, and proves that the displayed
revision is still the applicable current D12/D1 lane head. If it is no longer
current, Core performs no evaluation or handoff, refreshes the chooser
unselected, and announces **Source availability changed**. It never silently
substitutes a successor revision.

**Check again** invokes the existing source-owned D70 evaluation for the same
complete evidence identity. The server reauthorizes exact head visibility and
recovery authority, coalesces one in-flight work identity, applies its accepted
rate/backoff policy, and reconciles lost responses. Repeated clicks, tabs, or
transport retries cannot create another evaluation. D71 creates no job, polling
loop, offline queue, retry ledger, timer, or workflow.

While checking, only the recovery control/subregion is pending; qualified radios
and the Sheet remain usable. One aggregate, initially empty `role="status"`
region with polite, atomic behavior announces user-triggered checking outcomes.
Static rows carry no live-region semantics. D71 adds no automatic polling.

A newly qualified head enters the existing RadioGroup in canonical order and
remains unselected. Nonfocused finding/status refresh never moves focus. If a
user-triggered action remains, focus remains on it. If the focused action or row
disappears because qualification or access changed, focus moves to the persistent
**Source version** heading using programmatic focus and exactly one neutral
outcome is announced; the live region itself never receives focus. Access loss
reveals only **Source availability changed**. A selected qualified candidate that
loses eligibility continues ADR-0190/0191's stronger blocking cause-focus
recovery and creates nothing.

Opening a source uses one server-built, independently authorized, head-accurate
destination and preserves a permission-safe return to the same target Copy
intent. Return performs one fresh, unselected projection. It carries no authority
or stale selection across the handoff.

### Data, authorization, performance, and rollout

D71 persists nothing. The server response keeps qualified candidates and
authorized unavailable/unknown heads in separate typed members with nonoverlapping
discriminants; exact field names remain design-owned. An older compatible client
continues to consume only the qualified candidate member and safely ignores the
additive status member. A status variant can never deserialize as a candidate.

Authorization filters before projection, ordering, aggregation, paging, and
reason/action mapping. Actor, scope, capability epoch, time, identities, reason
family, and destinations derive from trusted server context. D71 issues no direct
table query, grant, RLS policy, service-role path, RPC, or mutation; it inherits
D68–D70 complete-scope relationships, minimum grants, applicable FORCE RLS,
operation-correct `USING`/`WITH CHECK`, hardened functions, and privileged-path
poison tests. Private responses remain `no-store` and never enter a public,
Vercel/shared, or persistent browser cache.

Candidate and status members come from the same authorization/head snapshot and
D68 page/search cursor. Page and search authorization-filter D68 locale groups
before head disposition. A locale group remains in the page when it contains at
least one qualified candidate or one authorized unavailable/unknown head;
candidate-only paging must never discard a status-only locale group. Both typed
members share one snapshot revision and cursor. D71 creates no second resolver,
count query, per-row read, body/diff/history fetch, N+1, provider call, or
external I/O. It remains inside
D69's p95 300 ms metadata budget. Activation tests the Site Locale owner's
maximum supported catalog with two displayable heads per locale, including the
worst case in which every authorized head is unavailable or unknown, longest
supported localized copy, 320-pixel/400-percent reflow, assistive technology,
and weak network. If that owner has not governed a maximum, D71 activation
remains off. Failure of the visible-list usability/performance gate blocks
activation; it does not silently switch to a collapsed/mobile variant or invent
a new cap.

Rollout is additive: land the separated response shape and old-client contract,
then the semantic list and recovery, then enable by cohort. A D71 presentation
kill switch may hide only the status member/list; it cannot change qualification,
candidates, evidence, targets, Bases, receipts, or D70 recovery. Rollback remains
reader-compatible and writer-free because D71 owns no durable state.

## Consequences

- Authorized staff can see why a recent/private or published head is absent
  without turning a nonchoice into a disabled control.
- The RadioGroup keeps one predictable selectable set and keyboard model.
- Unknown, proved unavailable, unauthorized, and whole-query failure cannot
  collapse into one misleading state.
- Recovery is discoverable and reliable without another workflow or retry store.
- The visible list costs some vertical space; D68 paging/search and activation
  evidence bound that cost.

## Rejected alternatives

- **Collapsed disclosure by default:** valid but adds an interaction/focus stop,
  hides why recent work disappeared, and creates count/completeness pressure.
- **Notice before the chooser:** separates the affected exact head from the
  decision and risks a stale second projection.
- **Disabled radios:** mixes nonchoices into selectable semantics, increases
  arrow/screen-reader ambiguity, and encourages generic disabled-state copy.
- **Hide every unavailable head:** privacy-safe but misleading for authorized
  staff and provides no cause-owned recovery.
- **One generic Retry or repair center:** conflates whole-query failure, exact
  qualification recovery, source editing, and platform-owned repair.

## References

- [ADR-0189 — Suggested translation sources](./0189-site-suggested-translation-sources-are-authoring-only.md)
- [ADR-0190 — Two exact Copy source heads](./0190-two-head-copy-sources-and-immutable-draft-checkpoints.md)
- [ADR-0191 — Revision-bound Copy Qualification](./0191-revision-bound-copy-qualification-with-non-gating-source-findings.md)
- [Phase 24 D71 adversarial review](../prds/sitestacker-parity/phase-24-d71-qualified-choices-visible-unavailable-list-adversarial-review.md)
- [W3C ARIA APG Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)
- [W3C keyboard interface guidance](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [Base UI Radio](https://base-ui.com/react/components/radio)
- [Base UI Dialog focus management](https://base-ui.com/react/components/dialog)
- [shadcn/Base UI Item](https://ui.shadcn.com/docs/components/base/item)
- [GOV.UK radios](https://design-system.service.gov.uk/components/radios/)
- [GOV.UK buttons](https://design-system.service.gov.uk/components/button/)
- [Drupal Content Translation overview](https://www.drupal.org/docs/8/core/modules/content-translation/overview)
- [Contentful localization strategies](https://www.contentful.com/help/localization/field-and-entry-localization/)
