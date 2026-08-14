# Platform Surfaces Delta

## ADDED Requirements

### Requirement: Missionary Workspace Provides One Quiet Assigned-Pages Experience

The Missionary Workspace SHALL show every and only the Missionary and
Project/Campaign Pages for which the current Principal has an active exact D1
Public Page Contributor Assignment. It SHALL provide focused authoring, preview,
final intent, review feedback, Ministry Update, optional exact-Page activity, and
recovery actions without exposing staff configuration, tenant-wide queues,
private supporter details, or financial depth that the person was not separately
granted.
The Page editor SHALL organize only compatible tenant-enabled roles into the
five quiet groups `Basics`, `Story`, `Media`, `Support & giving`, and `Updates`.
It SHALL NOT expose generic layout, schema, permission, workflow, or publication
controls to contributors.

#### Scenario: A missionary manages several assigned Pages

- **WHEN** the missionary opens Public Pages
- **THEN** the workspace presents a calm list of the assigned Pages with current
  public/review state and the next available action
- **AND** one Page's subject, permissions, drafts, or support modules never bleed
  into another

#### Scenario: No action is required

- **WHEN** all assigned Pages are current and no feedback or cause needs the
  missionary
- **THEN** the workspace remains quiet and prioritizes ordinary ministry work
- **AND** it does not display internal propagation or healthy-system noise

### Requirement: Mission Control Provides One Review Operations And Settings Home

Mission Control SHALL provide one review queue and one Public Pages workspace
whose `To review`, `Needs attention`, `All pages`, and setup/settings views are
derived from current source-owned facts. Review SHALL present exact candidate
diff and preview with `Approve & publish` and `Request changes` as the primary
actions and terminal `Reject` as a deliberately secondary action. Operations
SHALL group by cause, impact, owner, and safe next action. Settings
SHALL ask only D23's two family reach and one review question during initial
setup, then use exactly `Visibility and publishing`, `Page appearance and
discovery`, `Optional features`, and `Chosen on each page` with short scope-first
owner forms and plain-language consequence previews. Initial unset values SHALL
appear only as `Safe fallback — not yet chosen: Not public`, `Safe fallback —
not yet chosen: Review before publishing`, or `Safe fallback — not yet chosen:
Responses off`, never as saved organization choices. Presentation authoring
SHALL separate `Page design — all languages` from `Content — this language`;
contributors SHALL see tenant-owned structure as `Set by your organization`,
and single-locale Sites SHALL not show unnecessary locale machinery.
The exact D10 candidate preview SHALL remain review truth; the separate current
public Page SHALL appear only as `View live page`. In the review surface,
`Approve & publish` and `Request changes` SHALL remain primary, while `Edit
page` SHALL be secondary and appear only with independent D24 edit authority;
it SHALL create a successor rather than changing the reviewed candidate in
place.

#### Scenario: Staff review a contributor change

- **WHEN** a current candidate requires review
- **THEN** the reviewer sees its author, attestation, exact differences, safe
  preview, and changed dependencies in one place
- **AND** no in-place edit, force-publish, or alternate workflow is offered

#### Scenario: A setting is uncommon or disabled

- **WHEN** a tenant does not use progress, comments, measurement, AI, or another
  optional capability
- **THEN** the ordinary workspace remains uncluttered
- **AND** the capability is discoverable through setup/settings with its current
  owner, consequence, and activation requirement

#### Scenario: Staff change one family design

- **WHEN** authorized staff open `Page design — all languages`
- **THEN** the consequence preview covers the complete current family and locale
  cohort before the owner CAS
- **AND** the action does not translate content, advance any locale release, or
  present per-Page layout controls

### Requirement: Public Website Presents Typed Pages Without Operational Leakage

The Public Tenant Website SHALL render Missionary and Project/Campaign Pages as
distinct tenant-branded experiences using their one current Site-family profile
and exact locale release. It SHALL expose only D2/Phase-10-admitted public
content, safe media, optional source-certified progress, Ministry Updates,
bounded directory/search/share presentation, and the one D7 Give destination.
It SHALL NOT expose internal subjects, assignments, source types, workflow,
supporter responses, identifiers, or failure diagnostics.

#### Scenario: A visitor opens a Missionary Page

- **WHEN** an exact locale release is currently admitted
- **THEN** the visitor sees the approved missionary story, media, optional
  progress and Updates, and consistent Give action
- **AND** no private roster, supporter, assignment, draft, or operational field
  is included in HTML, RSC payloads, metadata, or client data

#### Scenario: A visitor opens a Project/Campaign Page

- **WHEN** the Page's exact typed subject and public dependencies are current
- **THEN** the visitor sees the Project/Campaign family presentation
- **AND** the UI does not reveal whether the source is an internal Project,
  Campaign, or eligible Designation

### Requirement: Public Serving And Convergence Status Remains Quiet

Contributors SHALL see only `Public`, `Updating`, or `Not public` for an exact
Page or Ministry Update and SHALL receive no cache, CDN, TTL, tag, queue,
generation, probe, purge, or provider controls. Mission Control MAY show
`Visitor access stopped - cleanup continuing` after local denial is effective
and SHALL show `Needs attention` only when a controlled-surface deadline is
missed or an exact owner cause requires authorized action. Progressive detail
SHALL distinguish release activation, current admission, expiration requested,
provider acceptance, controlled response observation, unverifiable coverage,
and external observation. No UI SHALL offer `Purge`, `Force live`, or `Mark
fixed` as public truth.
D21 migration SHALL add no Page lifecycle or editorial status. Its staff-only
readiness projection SHALL use `Ready to use`, `Needs a decision`, or `Not
moving as a current ministry page`, with the last state naming the exact D8
disposition. Cutover receipt wording SHALL remain a transient operation result,
not Page state, and SHALL never use `Live` as D21 truth.

#### Scenario: Healthy propagation requires no work

- **WHEN** a positive release is converging within its bounded freshness class
  and no adverse or missed-deadline cause exists
- **THEN** the contributor may see `Updating` without technical diagnostics
- **AND** staff receive no task, alert, or repeated certification request

#### Scenario: Visitor access stops before cleanup completes

- **WHEN** current admission denies an adverse Page while controlled surfaces
  are still converging
- **THEN** visitors receive only safe absence, redirect, or neutral unavailable
  behavior
- **AND** authorized staff may see `Visitor access stopped - cleanup continuing`
  without a claim of recall, de-indexing, or external erasure

### Requirement: Public Discovery May Be Combined Or Family-Separated Without Forking Truth

A tenant MAY choose one combined Public Ministry Directory with typed sections
or separate Missionary and Project/Campaign destinations. Both presentations
SHALL use the same exact D13 corpus, filters, keyset pagination, Page cards, reach
and safety admission, empty/error semantics, and URL-backed search state.
Configuration SHALL NOT create Page-level inclusion controls or a second search
index authority.

#### Scenario: A tenant switches directory presentation

- **WHEN** staff changes from combined to separate family destinations
- **THEN** visitors see the same eligible corpus through the new bounded views
- **AND** search membership and Page reach do not change

#### Scenario: No results match

- **WHEN** an admitted bounded query has no result
- **THEN** the public surface provides a useful clear-empty state and preserves
  the query for refinement
- **AND** it reveals nothing about excluded or protected records

### Requirement: Public Search Share And Giving Controls Stay Simple And Accessible

Every eligible Listed Page and public Ministry Update SHALL render server-side
search-ready metadata and one quiet Share action using native sharing when
available with a first-party Copy-link fallback. Shared-by-link releases SHALL
remain shareable but noindex and absent from discovery. Give SHALL remain the
clear primary consequential action and SHALL preserve exact checkout context.
Passive third-party widgets, arbitrary scripts, dark patterns, and claims of a
completed share or gift SHALL be absent.

#### Scenario: A visitor shares a public Page

- **WHEN** the visitor activates Share
- **THEN** an accessible menu invokes the supported native action or Copy link
- **AND** the UI reports only the locally observed outcome

#### Scenario: A Give destination is unavailable

- **WHEN** the exact Designation cannot be re-proved
- **THEN** Give becomes unavailable with calm specific copy
- **AND** the rest of the safe Page does not collapse into an operational error

### Requirement: Public Page Activity Is Fixed Simple And Accessible

Measurement setup SHALL offer exactly `Off`, `Staff only — Recommended`, and
`Staff + assigned page contributors` with one plain-language consequence
preview and no per-Page metrics or custom-event configuration. The authorized
report SHALL be titled `Public page activity`, use `Aggregate activity for your
public pages and ministry updates`, label its metrics `Qualified page loads`,
`Full update opens`, `Share options opened`, and `Give button selected`, and use
complete-day 7/30/90-day presets. It SHALL provide fixed definitions, `Data
complete through [date]`, honest Complete/Delayed/Partial/Unavailable and
suppression-safe results, and an equivalent accessible HTML table. Visitors
SHALL receive no activity dashboard or operational depth.

#### Scenario: Two assigned contributors open the same Page report

- **WHEN** the current profile permits contributor visibility and both exact D1
  assignments remain current
- **THEN** both actors receive the same suppression-safe exact-Page aggregate
  and coverage state
- **AND** neither receives tenant-wide, identity, source, raw-event, sparse, or
  financial drill-down

#### Scenario: The visual chart is not usable

- **WHEN** an authorized actor navigates by keyboard, screen reader, reflow,
  forced colors, or without the chart
- **THEN** the HTML table and fixed definitions provide equivalent information
- **AND** coverage or suppression is not conveyed by color alone

### Requirement: Public Page Editing Is Accessible Recoverable And Consequence-Clear

Authoring and staff surfaces SHALL use progressive disclosure, field-level help,
plain language, responsive preview, clear save state, accessible comparison,
and cause-specific recovery. Final actions SHALL state whether work will publish
after checks or go to staff review. Optional writing assistance SHALL remain an
explicit secondary action and translation SHALL carry the `Check this
translation. AI translation can make mistakes or miss context. Review this
English draft carefully before using it.` warning, the expandable review
checklist including `This is not a certified translation.`, and the literal
`Use English draft` action. No UI label SHALL conflate saved, submitted, approved,
released, cached, indexed, shared, selected, donated, or paid.
Routine private recovery MAY show `Saving` and after authoritative success SHALL
show `Saved privately` with a subtle last-saved time; it SHALL not announce each
autosave. When preserved work cannot proceed unchanged, the exact message SHALL
be `Your earlier changes are saved, but this page has changed since then. Review
them against the current page before submitting again.` with `Review saved
changes` primary, an authorized `View saved version` secondary, accessible
`Added`/`Removed`/`Changed` comparison, and `Use as starting point`. Reuse SHALL
still require a separate `Submit for review` or `Publish changes` action. The UI
SHALL NOT label work Expired or Archived, expose branch/merge/version jargon,
offer destructive Restore, or steal focus; recovery SHALL remain usable in a
single-column mobile layout.
When writing assistance is eligible, one subdued `Help me write` control SHALL
show `What AI will use` before egress and present the suggestion outside the
editable draft with exact `Replace selected text` or `Insert draft`, `Try
again`, and `Discard` actions. Mobile SHALL expose the same semantic actions in
an accessible bottom sheet or equivalent without gesture-only behavior.

At final intent the surface SHALL place the D26 confirmation immediately beside
`Submit for review` or `Publish changes`, without a checkbox or modal. Image
selection SHALL say `Use a photo you're allowed to share. We remove hidden
location and file details before it appears publicly.` and MAY disclose `Photo
sharing tips` for recognizable people, children, precise locations, and personal
details without claiming that upload or sanitization proves permission.

#### Scenario: An autosave fails

- **WHEN** the editor cannot confirm a private save
- **THEN** current input is preserved and the UI offers inspect/retry or copy
  recovery without blocking unrelated fields
- **AND** the current public Page remains unchanged

#### Scenario: Preserved work targets an older Page head

- **WHEN** an authorized editor returns after the coherent Page context changed
- **THEN** the surface shows the exact saved-work message and `Review saved
changes`
- **AND** `Use as starting point` appends a newly attributed successor rather
  than restoring, merging, submitting, or publishing the preserved source

#### Scenario: The editor uses assistive technology

- **WHEN** they edit, compare, preview, confirm, submit, or recover work
- **THEN** names, focus, status announcements, errors, keyboard behavior, reflow,
  contrast, and touch targets meet the platform accessibility contract
- **AND** meaning is never conveyed by color, animation, or layout alone

### Requirement: Ministry Updates Remain One Connected Cross-Surface Flow

One canonical Ministry Update MAY appear through independently governed public
Page and authenticated supporter projections without becoming copied posts.
The Missionary Workspace SHALL author it, the D4/D5 lane SHALL review it when
required, the public website SHALL render only the public projection, and
authenticated supporter surfaces SHALL render only currently authorized
supporter projections and D12 responses.

#### Scenario: One Update has public and supporter audiences

- **WHEN** both audience projections are current
- **THEN** each surface renders the same pinned canonical version through its
  own authorized projection
- **AND** supporter responses never appear on the anonymous public Page

#### Scenario: The public projection is withdrawn

- **WHEN** the public audience release becomes ineligible
- **THEN** public Page placements and discovery stop adverse-first
- **AND** an independently authorized supporter projection may remain available
