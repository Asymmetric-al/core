# ADR-0141: Attribution-preserving Staff-authored Page Revisions

**Status:** Accepted (founder-ratified Phase 22 D24 C-prime-R, 2026-08-14)

## Context

The organization owns its Public Ministry Pages and sometimes needs staff to
correct or replace bounded presentation content proposed by a missionary,
spouse, teammate, or project contributor. Treating this as an elevated in-place
override would erase authorship, lose concurrent work, blur editing with review
or release, and make Payload's mutable status, restore, access, lock, or autosave
behavior accidental product authority. Creating a separate staff draft,
approval lane, branch model, or setting would duplicate the already-ratified D1
working-revision and D4/D5 review contracts.

## Decision

Adopt the exact founder-ratified Phase 22 D24 C-prime-R formulation:

> **C-prime-amended-and-hardened (C-prime-R) — one attribution-preserving
> Staff-authored Page Revision path inside D1's sole coherent working-revision
> contract, D20's bounded typed editorial surface, and D4/D5's sole candidate,
> review, and release contract for both Public Ministry Page families. A
> currently Phase-12-authorized staff Page content editor may use the ordinary
> `Edit page` action to create or resume one private staff-authored successor
> from the exact current coherent working head or, when none exists, the exact
> current live or D1-authorized initial private base. From one exact immutable
> submitted contributor candidate, an edit-capable staff member may use the
> same deliberately secondary `Edit page` action to derive a new
> staff-authored successor while preserving the candidate bytes and digest,
> contributor actors, submission and review facts, source lineage, and
> independent history. Review-only authority never grants edit; staff
> authorship never grants review, approval, release, reach, or public-safety
> authority; and the resulting revision follows the tenant's unchanged D4/D5
> `Submit for review` or `Publish changes` path through D2's sole release
> command.**
>
> **The ordinary path asks no source question and requires no reason. If an
> exact active or submitted contributor revision would be superseded, the UI
> first says whose work is preserved, what source will seed the staff revision,
> that nothing becomes public, and requires one short contributor-visible
> reason. If the coherent working head advanced after the reviewed submission,
> one exceptional consequence screen offers only `Continue from latest draft`
> (recommended) or `Start from submitted version`; the command still appends
> from and CAS-advances the exact current head while separately preserving the
> chosen same-scope content source. No arbitrary version picker, automatic
> merge, hidden branch, or last-write-wins overwrite exists. Every displaced
> draft, candidate, author, reason, and semantic comparison remains immutable,
> permission-filtered, and recoverable; `Use as starting point` creates another
> successor and never rewinds history.**
>
> **Each deliberate successor re-proves the current actor, exact staff edit
> capability and authorization epoch, Tenant, Legal Entity, environment, Site,
> locale, Page Family, Page, current assignment where applicable, lifecycle,
> Phase-10 ceiling, D3/D20 field allowlist and catalog generation, source
> identity and digest, expected working-head generation, and idempotency
> identity. It records exact actor and acting authority path, predecessor and
> same-scope content source, successor, changed semantic targets and diff
> digest, safe reason where required, server time, and outcome. Same-scope
> constraints, explicit grants, indexed deny-first RLS, a short compare-and-swap
> transaction, authoritative readback, complete-transaction retry for proved
> serialization/deadlock failures, and inspect-before-retry recovery make zero
> advanced rows a visible conflict rather than success. Payload remains the
> content/version store: every user-context Local API call carries the
> authenticated actor with `overrideAccess: false` and `overrideLock: false`;
> Payload locks, `_status`, Admin roles, restore, autosave, and native publish
> controls are never Asym authority. Cross-store work prepares one private,
> structurally inert content version before the short operational provenance,
> head, audit, and outbox commit; referenced semantic versions are retention
> pinned and pre-commit orphans are reconciled.**
>
> **The quiet experience keeps `Approve & publish` and `Request changes`
> primary during review, `Edit page` secondary, exact live
> preview visible, and managed source-owned facts read-only with links to their
> owning workflows. Private autosave never advances the semantic head,
> supersedes contributor work, releases content, or emits a notification.
> Contributors see `Staff updated this page`, the permission-safe actor or
> protected role label, through-time, safe reason where applicable, and an
> accessible changed-sections-only `Added` / `Removed` / `Changed` comparison;
> one privacy-minimized, idempotent notification intent is emitted only after a
> committed material supersession, request for action, genuine conflict, or
> release outcome, with Phases 6/17 retaining recipient, preference, dispatch,
> and delivery authority. Managed identity, D17 subject, D19 participants and
> support access, D2 reach and release, D8 route/lifecycle, D7 Designation, D6
> progress, D9 media, D11 Updates, D14 discovery/share, D15 measurement, Giving,
> finance, and Phase-10 safety remain independently source-owned.**
>
> **No separate staff-revision table, staff-override setting, missionary
> approval state, parallel queue, per-page workflow, branch model, CRDT or live
> coauthoring system, automatic content merge, per-word attribution theater,
> reason taxonomy, generic staff/admin role, relationship-derived permission,
> browser or service-role mutation, direct Payload Admin authority,
> `Approve with edits`, editing as a missionary, in-place candidate mutation,
> head rewind, destructive restore or delete, universal source chooser,
> mandatory reason for routine edits, autosave history or notification spam,
> raw-content logs, fake legacy actor/reason, blind retry, or claim that edited,
> autosaved, submitted, reviewed, approved, released, publicly reachable,
> indexed, Giving-ready, donated, settled, or paid are the same fact is
> permitted.**

Binding interpretation: the quoted **exact live preview** means D10's
exact-version, production-equivalent Public Ministry Preview, never current
public/live authority. Autosave remains private scratch until a deliberate
immutable Page Revision advances the semantic head. Same-scope proof uses
complete operational provenance constraints plus adapter validation of the
Payload version scope and digest; it creates no cross-schema CMS-to-operational
foreign key. D24 adds only its material-supersession or genuine-conflict
occurrence; D5 request-changes and D2/D4/D5 release occurrences are reused, and
Phases 6/17 retain their communication authorities.

Staff authorship is therefore a qualification of the ordinary Page Revision,
not a new content type or workflow. The product command and immutable
provenance own its meaning; Payload supplies bounded content/version storage
only.

## Consequences

### Positive

- Staff use the same calm editor and exact Page workflow as contributors rather
  than learning an override or parallel approval system.
- Contributor work, actor identity, source, reason where required, and semantic
  comparison remain preserved instead of being overwritten or misattributed.
- Edit, review, release, safety, reach, operational references, and notification
  delivery remain independently authorized and authoritative.
- Exact-source CAS, idempotency, retention pins, and inspect-before-retry
  recovery protect concurrent work and ambiguous outcomes.

### Costs and constraints

- Phase 12 needs an exact staff Page-content capability distinct from review and
  release, and D3/D20 need a precise staff-editable semantic allowlist.
- CMS content preparation and operational provenance/head advancement cannot be
  claimed as cross-store atomic; inert preparation, reconciliation, and
  retention proof are required.
- Legacy Payload versions without proved actor/source evidence must remain
  explicitly unknown rather than receiving fabricated attribution.
- Representative contributor/staff comprehension, accessibility, isolation,
  concurrency, retention, and failure-recovery certification is mandatory.

## Rejected alternatives

### In-place staff override or `Approve with edits`

Rejected because it mutates contributor evidence, conflates authorship with a
review decision, and makes attribution unreliable.

### Separate staff draft, queue, or per-Page workflow

Rejected because D1 and D4/D5 already own one coherent working revision and one
candidate/release lane.

### Git-like branches, automatic merge, or live multi-author coediting

Rejected because the product needs bounded revision handoff, not a general
collaboration platform. One linear head and a rare explicit consequence choice
are easier to understand and certify.

### Payload-native publish, restore, role, lock, or status as authority

Rejected because Payload defaults and lifecycle primitives do not prove Asym's
exact scope, current authorization, safety, provenance, review, or release
contract.

Ratification of this planning decision authorizes no implementation, migration,
notification, issue publication, or production activation.

## References

- [Phase 22 ratified D24 decision](../prds/sitestacker-parity/phase-22-public-ministry-pages-decision-log.md#d24--how-may-authorized-staff-revise-contributor-authored-public-page-content-without-erasing-attribution-or-creating-a-second-workflow)
- [Phase 22 ratified D24 research evidence](../prds/sitestacker-parity/phase-22-public-ministry-pages-research-evidence.md#47-ratified-d24-research--attribution-preserving-staff-authored-page-revisions)
- [ADR-0118 — Typed Public Ministry Pages and explicit contributor assignments](./0118-typed-public-ministry-pages-and-explicit-contributor-assignments.md)
- [ADR-0121 — Tenant-chosen Public Content review and release profiles](./0121-tenant-chosen-public-content-review-and-release-profiles.md)
- [ADR-0122 — Simple Public Page review with quiet Phase-10 eligibility](./0122-simple-public-page-review-with-quiet-phase-10-eligibility.md)
- [ADR-0137 — Two bounded Page Family semantic catalogs](./0137-two-bounded-page-family-semantic-catalogs.md)
