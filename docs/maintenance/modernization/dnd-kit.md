# Current dnd-kit API checkpoint

Tracking: [AL-1965](https://github.com/Asymmetric-al/core/issues/1965).
Local frozen-install, strict quality, complete browser and full preflight gates
pass. Current-head review/CI, hosted previews and merge qualification remain open in
[qualification](dnd-kit-qualification.json). Production execution is outside this
checkpoint.

## Replacement and ownership

The official [legacy installation guide](https://dndkit.com/legacy/introduction/installation/)
recommends the new API. Core's only first-party consumer, the missionary task
board, follows the [current migration guide](https://dndkit.com/react/guides/migration/)
and coordinated `@dnd-kit/react`, `@dnd-kit/dom`, `@dnd-kit/helpers` and
`@dnd-kit/abstract` 0.5.1 releases. [Release metadata](dnd-kit-releases.json)
binds upstream versions, integrity, constraints and repository ownership.
Seven current Dnd packages resolve to one physical runtime each, including the
React/DOM peers; the reviewed peer-expanded closure has twelve packages.

Four unused admin declarations and three missionary legacy declarations are
removed. No first-party legacy import remains. No override or dependency patch
is introduced. Exact `base-maia`, Base UI controls, shared semantic tokens,
public component callbacks and the existing four visible task statuses remain.

## Preserved behavior

`DragDropProvider`, pointer/keyboard sensors, grouped/indexed sortable entries,
explicit column droppables and the public move helper replace legacy contexts,
attributes and listeners. Empty columns are real drop targets. React owns the
controlled preview lists; the upstream optimistic DOM-reparenting plugin is
excluded from sortable defaults because it conflicts with that ownership.
Other default plugins, including keyboard/accessibility and auto-scroll, remain.

Only a confirmed, changed final destination submits the existing
`onMoveTask(taskId, status, index)` callback. Cancellation, missing targets and
unchanged positions submit no request. The drag manager remains suspended while
the save resolves. Declined and thrown saves restore committed order and expose
an accessible retry message. Keyboard focus restores after React commits the
restored list, while later intentional user focus is preserved.

Core's shared motion boundary supplies reduced-motion preference. Sortable/drop
feedback uses existing duration/easing tokens for pointer movement and instant
keyboard feedback. The public Feedback configuration disables upstream keyboard
translation; Core's shared 0.01 ms reduced-motion baseline remains authoritative.
The moving overlay is inert and has no duplicate sortable registration.

The actual `useTasks` hook still owns optimistic persistence and rollback through
the same-origin task PATCH endpoint with only status/sort_key payloads. Server
role, profile and tenant boundaries are unchanged.

## Evidence and remaining qualification

The offline fixture imports the actual board and shared controls. The recorded
36-case matrix covers nine contracts in desktop/mobile, light/dark and reduced
motion: pointer movement into an empty column, keyboard ordering/index/focus,
Escape, declined/thrown save recovery and retry, pending-save admission, no-op,
axe and actual Chromium touch input. Mobile pointer auto-scroll additionally
passes ten repeated cases. The final cold full browser suite passes299 cases with five existing skips,
including all40 task-board contracts across the four projects; this also covers
the subsequently added activation-distance/outside-drop case.
This is Chromium input qualification, not a physical-device performance claim.

Six new tests exercise the real mutation hook against controlled HTTP responses,
including pending optimistic state, final indices, empty destinations, denied
requests, network failures, rollback and missing tasks. Fourteen focused tests
also preserve fetch ordering, lifecycle, realtime and API-boundary contracts.
A frozen cold install reconstructs seventeen generated workspace install roots,
keeps the exact lock unchanged and preserves opaque environment inputs.

The old React Doctor exception for hook-provided attribute spreading no longer
applies to the ref-based integration. It must be removed, rather than retargeted
to new presentation callbacks. Independent requalification removes that one exception and updates26 support
hashes in21 retained records. Fresh strict Doctor passes all eight targets with
zero actionable findings and293 exact exceptions. Shadscan retains118 existing
classifications and every score floor, updating11 existing proof hashes plus
current actual-board verification. Full preflight also passes, including all app builds, typechecks and unit
coverage gates. Hosted qualification and merged current-develop requalification
remain mandatory. The qualification record owns dated outcomes.

## Required upstream compatibility and security

Official Payload Next/UI beta.3 still require legacy Dnd packages internally.
They remain upstream-owned compatibility candidates with explicit Core CMS
ownership and release/import/constraint/advisory recheck conditions. Public
Payload beta.4 was published during this checkpoint and retains those same
constraints. Its complete cohort must be qualified before the combined freeze;
this release is open work, not an indefinite hold on beta.3.

The new Dnd closure matches current official metadata and integrity, has no
missing or incompatible physical dependency/peer edge, and introduces no
advisory pair. Whole-Core advisories, including Braces 3.0.3, remain open.
This checkpoint grants no unreachability exception or whole-repository security
closure.
