# Design

## Audit ownership

Root tooling locks Shadscan 0.17.0, ruleset 2026.08.46, schema 9. A shared Node
entrypoint invokes the installed binary with argument arrays and static JSON
output. Hook and CI use the same implementation. Complete workspace discovery
must include exactly the three deployable application packages without source or
workspace truncation. Libraries remain visible but do not contribute to app
floors. Each app floor is captured from verified final source after repairs and
must not decrease from its initial 35/41/47 baseline.

Raw reports and scores remain unchanged. Exact project/rule/evidence identities,
source contracts, and positive/negative tests support classifications. A stale
classification is rejected or becomes unreviewed. A whole rule cannot be exempted
because its first reported example is a false positive; rescans after repairs and
targeted behavior tests cover the next visible examples.

Policy schema 2 requires all six category floors for each app. The gate derives
app categories from the validated raw assessments, preserving official weights
and rounding for baseline floors. Missing or wholly unassessed app categories
fail even at a zero floor. A 100-point category or overall app floor requires
all applicable scored points; an integer rounded to 100 is insufficient. The
schema migration preserves the current 43/59/47 overall floors and all verified
category percentages. It does not upgrade the engine or assert a perfect audit.

## Product decisions

All three apps intentionally force light. Do not add theme-toggle shortcuts.
Support's command shortcut is local to its focused workspace. Mission Control's
existing advertised global navigation search should navigate current permitted
routes and have a guarded Cmd/Ctrl+K handler without taking over Support's local
shortcut. Public donor and missionary flows do not receive a new global command
menu purely for audit points. The owner's 2026-10-04 amendment adds useful
palettes only to signed-in donor and missionary workspaces. Each shell mounts
one shared navigation widget with its existing app-owned destinations; both
platform shortcuts preserve editing and other popup ownership. Donor controls
retain mobile names, supported Maia sizes and pending sign-out feedback until
the existing session helper settles. Unsupported missionary notification and
theme actions are hidden under the retained forced-light policy.
Private surfaces remain noindex; their missing
social-card findings are product-policy differences. Donor's declared sharing
asset must actually resolve.

## UI changes

Use native anchors styled with shared `buttonVariants` for navigation. Shared
Base UI Sheet owns mobile map dialog focus/Escape behavior. Preserve styles and
tokens while naming icons/search controls, associating field errors, preventing
duplicate pending actions, announcing material changes, and providing meaningful
loading feedback. Preserve intentionally invisible redirect-only Suspense
siblings and the CMS preview's Block decision.

## Security and data

No schema, business mutation, credential, hosted initialization, or publication
change is required. Fixtures use local data and placeholder environment values.
The original root `.env.local` is not copied into the isolated worktree.

## Validation

TDD at existing component and script seams; deferred-promise tests for pending
behavior; offline Base UI Playwright fixtures for role/name, keyboard, focus,
responsive, and axe verification; full native Bun gates; all three builds;
current-head required GitHub checks and repository-authorized preview smoke.
Independent review checks source ownership, authorization, gate integrity, and
complete recommendation coverage before completion.
