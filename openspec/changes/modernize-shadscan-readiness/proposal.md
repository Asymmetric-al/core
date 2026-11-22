# Modernize Shadscan readiness

## Why

Core's current hook and CI audit only `packages/ui` using Shadscan 0.1.1 and a
29-point floor. That grades a shared library against application responsibilities
and does not independently protect the three applications. A current published
workspace scan reports application scores of 35, 41, and 47. Source review found
both genuine accessibility defects and scanner limitations involving shared
components, Base UI composition, and modern Next.js boundaries.

## What changes

- Use one exactly locked published scanner and shared gate for local and CI runs.
- Require complete discovery of admin, donor, and missionary applications;
  independently protect their raw score and six category floors and retain raw
  library findings. A 100-point floor requires every applicable scored point.
- Record narrowly verified scanner limitations and product-policy differences
  with executable evidence; do not rewrite raw statuses or scores.
- Repair confirmed names, relationships, announcements, loading/pending feedback,
  keyboard/focus behavior, interactive composition, and missing public assets.
- Restore meaningful Mission Control navigation search using existing permitted
  routes, preserving Support's focus-scoped shortcut.
- Add owner-approved navigation palettes to signed-in donor and missionary
  workspaces using shared Base UI/base-maia and existing app-owned routes.
- Preserve forced-light themes, Base UI/base-maia, shared component ownership,
  global Next recovery, and authorization-blocked preview behavior.

## Scope and non-goals

This change implements AL-1931 and the user's complete Shadscan recommendations.
It does not replace Core's component system, copy primitives into applications,
add application-local `components.json`, introduce dark-mode shortcuts contrary
to forced-light policy, reset or seed hosted data, change tenant authorization,
or deploy production. Scanner findings are evidence, not product authority.

## Affected capabilities

- ADDED: `ui-quality-audits` — reproducible workspace coverage, per-application
  regression gates, transparent classification, and UI interaction verification.
- Existing platform accessibility, source authority, TDD, and UI invariants remain
  unchanged.

## Rollback

Revert the code/tooling commit while preserving database schemas, content,
credentials, and the original development checkout. Audit rollback must keep
CLI execution and documented floors internally consistent.

## Superseded 2026-11-18 by `make-shadscan-advisory`

On 2026-11-18 the owner ratified the retirement part of `make-shadscan-advisory`
("Do #2"). From that date:

- Shadscan no longer blocks a commit, push, local preflight or required CI
  check. It runs once per CI event in a non-required job and its scores are
  advisory.
- The per-application and per-category score floors, the policy file, the
  hashed findings ledger and the "genuine 100/100" target are retired. The
  text above that describes them, and the 2026-10-04 approval of floors and
  of the 100/100 target, is dated history.
- This change's delta withdraws four requirements: "Workspace UI Audits Are
  Reproducible And Complete", "Each Application Has An Independent Score
  Floor", "Each Application Category Has An Independent Score Floor" and
  "Audit Classifications Preserve Evidence". Its Purpose now matches
  `make-shadscan-advisory`'s word for word.
- Tasks 5.2, 5.5, 5.7 and 5.8 and the finding-proof clause of task 4.9 are
  withdrawn.

The UI-repair, component-review and browser-evidence requirements, the
forced-light policy, the signed-in palettes, and open tasks 3.5, 5.3, 5.4,
5.6 and the rest of 4.9 are unchanged.
